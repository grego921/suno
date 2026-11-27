import {
  ApiResponse,
  BackendConfig,
  GenerationParams,
  GenerationResult,
  RandomSampleData,
  ServerStats,
} from "./types";

export function normalizeBaseUrl(url: string): string {
  let cleaned = url.trim();
  if (!cleaned) return "";
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = "https://" + cleaned;
  }
  return cleaned.replace(/\/+$/, "");
}

function getHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["x-api-key"] = token;
  }
  return headers;
}

export async function checkHealth(
  apiUrl: string,
  token?: string
): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const base = normalizeBaseUrl(apiUrl);
  if (!base) {
    return { ok: false, latencyMs: 0, error: "API URL is required" };
  }

  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    const resp = await fetch(`${base}/health${tokenQuery}`, {
      method: "GET",
      headers: getHeaders(token),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);

    if (!resp.ok) {
      if (resp.status === 401) {
        return { ok: false, latencyMs, error: "Authentication failed: invalid token" };
      }
      return {
        ok: false,
        latencyMs,
        error: `Server returned HTTP ${resp.status}: ${resp.statusText}`,
      };
    }

    const data: ApiResponse = await resp.json();
    if (data.code && data.code !== 200) {
      return { ok: false, latencyMs, error: data.error || `Error code ${data.code}` };
    }

    return { ok: true, latencyMs };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    let message = err.message || "Failed to reach server";
    if (err.name === "AbortError") {
      message = "Connection timed out (10s)";
    } else if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
      message = "Network error: check if Colab tunnel is active and CORS is allowed.";
    }
    return { ok: false, latencyMs, error: message };
  }
}

export async function fetchAvailableModels(
  apiUrl: string,
  token?: string
): Promise<{ models: string[]; defaultModel: string }> {
  const base = normalizeBaseUrl(apiUrl);
  if (!base) return { models: [], defaultModel: "acestep-v15-turbo" };

  try {
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    const resp = await fetch(`${base}/v1/models${tokenQuery}`, {
      method: "GET",
      headers: getHeaders(token),
    });

    if (resp.ok) {
      const json: ApiResponse<{
        models: Array<{ name: string; is_default: boolean }>;
        default_model: string;
      }> = await resp.json();

      if (json.data && json.data.models) {
        const names = json.data.models.map((m) => m.name);
        return {
          models: names,
          defaultModel: json.data.default_model || names[0] || "acestep-v15-turbo",
        };
      }
    }
  } catch (e) {
    console.warn("Could not fetch models from /v1/models, falling back to defaults:", e);
  }

  return {
    models: ["acestep-v15-turbo", "acestep-v15-base"],
    defaultModel: "acestep-v15-turbo",
  };
}

export async function fetchServerStats(
  apiUrl: string,
  token?: string
): Promise<ServerStats | null> {
  const base = normalizeBaseUrl(apiUrl);
  if (!base) return null;

  try {
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    const resp = await fetch(`${base}/v1/stats${tokenQuery}`, {
      method: "GET",
      headers: getHeaders(token),
    });
    if (resp.ok) {
      const json: ApiResponse<ServerStats> = await resp.json();
      return json.data || null;
    }
  } catch (e) {
    // silently ignore stats error
  }
  return null;
}

export async function releaseGenerationTask(
  config: BackendConfig,
  params: GenerationParams
): Promise<{ taskId: string; queuePosition?: number }> {
  const base = normalizeBaseUrl(config.apiUrl);
  if (!base) throw new Error("Backend API URL is not configured. Please open Settings.");

  const requestBody: Record<string, any> = {
    prompt: params.prompt.trim(),
    lyrics: params.isInstrumental ? "" : params.lyrics.trim(),
    audio_duration: params.duration,
    batch_size: params.batchSize,
    inference_steps: params.inferenceSteps,
    guidance_scale: params.guidanceScale,
    use_random_seed: params.useRandomSeed,
    seed: params.useRandomSeed ? -1 : params.seed,
    thinking: params.thinking,
    audio_format: params.audioFormat || "mp3",
    vocal_language: params.vocalLanguage || "en",
    task_type: "text2music",
  };

  if (params.model) {
    requestBody.model = params.model;
  }
  if (params.bpm && params.bpm > 0) {
    requestBody.bpm = params.bpm;
  }
  if (params.keyScale && params.keyScale !== "auto") {
    requestBody.key_scale = params.keyScale;
  }
  if (params.timeSignature && params.timeSignature !== "auto") {
    requestBody.time_signature = params.timeSignature;
  }

  const tokenQuery = config.token ? `?token=${encodeURIComponent(config.token)}` : "";
  const resp = await fetch(`${base}/release_task${tokenQuery}`, {
    method: "POST",
    headers: getHeaders(config.token),
    body: JSON.stringify(requestBody),
  });

  if (!resp.ok) {
    const text = await resp.text();
    let errorDetail = `HTTP ${resp.status}: ${resp.statusText}`;
    try {
      const errJson = JSON.parse(text);
      errorDetail = errJson.error || errJson.detail || errorDetail;
    } catch {}
    throw new Error(`Failed to create task: ${errorDetail}`);
  }

  const json: ApiResponse<{
    task_id: string;
    status: string;
    queue_position?: number;
  }> = await resp.json();

  if (json.code && json.code !== 200) {
    throw new Error(json.error || `Task submission rejected with code ${json.code}`);
  }

  return {
    taskId: json.data.task_id,
    queuePosition: json.data.queue_position,
  };
}

export async function queryTaskStatus(
  config: BackendConfig,
  taskId: string
): Promise<{
  status: "queued" | "running" | "succeeded" | "failed";
  results: GenerationResult[];
  error?: string;
}> {
  const base = normalizeBaseUrl(config.apiUrl);
  if (!base) throw new Error("API URL missing");

  const tokenQuery = config.token ? `?token=${encodeURIComponent(config.token)}` : "";
  const resp = await fetch(`${base}/query_result${tokenQuery}`, {
    method: "POST",
    headers: getHeaders(config.token),
    body: JSON.stringify({
      task_id_list: [taskId],
    }),
  });

  if (!resp.ok) {
    throw new Error(`Query failed: HTTP ${resp.status} ${resp.statusText}`);
  }

  const json: ApiResponse<
    Array<{
      task_id: string;
      status: number; // 0 = queued/running, 1 = succeeded, 2 = failed
      result?: string; // JSON string with array of outputs
    }>
  > = await resp.json();

  if (!json.data || json.data.length === 0) {
    return { status: "running", results: [] };
  }

  const taskData = json.data[0];

  if (taskData.status === 2) {
    return {
      status: "failed",
      results: [],
      error: "Generation failed on ACE-Step server. Check Colab logs for GPU/VRAM issues.",
    };
  }

  if (taskData.status === 0) {
    return { status: "running", results: [] };
  }

  // Status is 1 -> Succeeded!
  const results: GenerationResult[] = [];
  if (taskData.result) {
    try {
      const parsed = JSON.parse(taskData.result);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any, idx: number) => {
          const rawFile = item.file || "";
          let fileUrl = rawFile;
          // Build absolute URL if rawFile is a relative path
          if (rawFile.startsWith("/")) {
            fileUrl = `${base}${rawFile}`;
          } else if (!rawFile.startsWith("http")) {
            fileUrl = `${base}/v1/audio?path=${encodeURIComponent(rawFile)}`;
          }

          // Append token parameter so audio element can stream authenticated
          if (config.token && !fileUrl.includes("token=")) {
            const separator = fileUrl.includes("?") ? "&" : "?";
            fileUrl += `${separator}token=${encodeURIComponent(config.token)}`;
          }

          results.push({
            id: `${taskId}-${idx}`,
            taskId,
            variationIndex: idx + 1,
            fileUrl,
            audioPath: rawFile,
            prompt: item.prompt || "",
            lyrics: item.lyrics || "",
            duration: item.metas?.duration || 0,
            bpm: item.metas?.bpm,
            keyScale: item.metas?.keyscale,
            timeSignature: item.metas?.timesignature,
            seed: item.seed_value,
            model: item.dit_model,
            createdAt: Date.now(),
          });
        });
      }
    } catch (e) {
      console.error("Error parsing task result JSON string:", e);
    }
  }

  return {
    status: "succeeded",
    results,
  };
}

export async function requestRandomSample(
  config: BackendConfig,
  sampleType: "simple_mode" | "custom_mode" = "simple_mode"
): Promise<RandomSampleData> {
  const base = normalizeBaseUrl(config.apiUrl);
  if (!base) throw new Error("API URL not configured");

  const tokenQuery = config.token ? `?token=${encodeURIComponent(config.token)}` : "";
  const resp = await fetch(`${base}/create_random_sample${tokenQuery}`, {
    method: "POST",
    headers: getHeaders(config.token),
    body: JSON.stringify({ sample_type: sampleType }),
  });

  if (!resp.ok) {
    throw new Error(`Sample request failed: HTTP ${resp.status}`);
  }

  const json: ApiResponse<RandomSampleData> = await resp.json();
  if (json.code !== 200 || !json.data) {
    throw new Error(json.error || "Failed to generate random sample");
  }

  return json.data;
}

export async function requestFormatInput(
  config: BackendConfig,
  prompt: string,
  lyrics: string,
  duration?: number
): Promise<{ caption: string; lyrics: string; bpm?: number; key_scale?: string; time_signature?: string }> {
  const base = normalizeBaseUrl(config.apiUrl);
  if (!base) throw new Error("API URL not configured");

  const paramObj: Record<string, any> = {};
  if (duration) paramObj.duration = duration;

  const tokenQuery = config.token ? `?token=${encodeURIComponent(config.token)}` : "";
  const resp = await fetch(`${base}/format_input${tokenQuery}`, {
    method: "POST",
    headers: getHeaders(config.token),
    body: JSON.stringify({
      prompt,
      lyrics,
      param_obj: JSON.stringify(paramObj),
    }),
  });

  if (!resp.ok) {
    throw new Error(`Format request failed: HTTP ${resp.status}`);
  }

  const json: ApiResponse<{
    caption: string;
    lyrics: string;
    bpm?: number;
    key_scale?: string;
    time_signature?: string;
  }> = await resp.json();

  if (json.code !== 200 || !json.data) {
    throw new Error(json.error || "Failed to format input");
  }

  return json.data;
}
