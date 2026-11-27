import { BackendConfig, GenerationResult, GenerationTask } from "./types";

const CONFIG_KEY = "ace_step_backend_config";
const HISTORY_KEY = "ace_step_history";
const TASKS_KEY = "ace_step_tasks";

export function getStoredConfig(): BackendConfig {
  if (typeof window === "undefined") {
    return {
      apiUrl: "",
      token: "",
      isConnected: false,
      isChecking: false,
    };
  }

  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        apiUrl: parsed.apiUrl || "",
        token: parsed.token || "",
        isConnected: false,
        isChecking: false,
        models: parsed.models || [],
        defaultModel: parsed.defaultModel || "acestep-v15-turbo",
      };
    }
  } catch (e) {
    console.error("Failed to parse stored config:", e);
  }

  return {
    apiUrl: "",
    token: "",
    isConnected: false,
    isChecking: false,
  };
}

export function saveStoredConfig(config: Partial<BackendConfig>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredConfig();
    const merged = { ...current, ...config };
    localStorage.setItem(
      CONFIG_KEY,
      JSON.stringify({
        apiUrl: merged.apiUrl,
        token: merged.token,
        models: merged.models,
        defaultModel: merged.defaultModel,
      })
    );
  } catch (e) {
    console.error("Failed to save config:", e);
  }
}

export function extractAndSaveUrlParams(): { apiUrl?: string; token?: string } | null {
  if (typeof window === "undefined") return null;

  try {
    const url = new URL(window.location.href);
    const apiParam = url.searchParams.get("api");
    const tokenParam = url.searchParams.get("token");

    if (apiParam || tokenParam) {
      const updates: Partial<BackendConfig> = {};
      if (apiParam) updates.apiUrl = apiParam.trim();
      if (tokenParam) updates.token = tokenParam.trim();

      saveStoredConfig(updates);

      // Clean the URL without reloading to avoid leaking secrets
      url.searchParams.delete("api");
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ""));

      return updates;
    }
  } catch (e) {
    console.error("Failed to extract URL params:", e);
  }

  return null;
}

export function getStoredHistory(): GenerationResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load history:", e);
  }
  return [];
}

export function saveResultToHistory(result: GenerationResult): void {
  if (typeof window === "undefined") return;
  try {
    const history = getStoredHistory();
    // Prepend new result, avoid duplicates
    const filtered = history.filter((item) => item.id !== result.id);
    const updated = [result, ...filtered].slice(0, 100); // keep up to 100 items
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save result to history:", e);
  }
}

export function removeResultFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getStoredHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to remove result from history:", e);
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error("Failed to clear history:", e);
  }
}

export function getStoredTasks(): GenerationTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load tasks:", e);
  }
  return [];
}

export function saveStoredTasks(tasks: GenerationTask[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks.slice(0, 30)));
  } catch (e) {
    console.error("Failed to save tasks:", e);
  }
}
