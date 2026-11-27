export interface BackendConfig {
  apiUrl: string;
  token: string;
  isConnected: boolean;
  isChecking: boolean;
  latencyMs?: number;
  lastChecked?: number;
  error?: string;
  models?: string[];
  defaultModel?: string;
}

export interface GenerationParams {
  prompt: string;
  lyrics: string;
  isInstrumental: boolean;
  duration: number; // in seconds
  batchSize: number; // 1 to 4
  model: string;
  inferenceSteps: number;
  guidanceScale: number;
  seed: number;
  useRandomSeed: boolean;
  bpm?: number;
  keyScale: string;
  timeSignature: string;
  vocalLanguage: string;
  audioFormat: string;
  thinking: boolean; // LM codes mode
}

export interface GenerationResult {
  id: string;
  taskId: string;
  variationIndex: number;
  fileUrl: string; // full playable URL
  audioPath: string; // raw path
  prompt: string;
  lyrics: string;
  duration: number;
  bpm?: number;
  keyScale?: string;
  timeSignature?: string;
  seed?: string;
  model?: string;
  createdAt: number;
}

export interface GenerationTask {
  id: string;
  taskId: string;
  prompt: string;
  lyrics: string;
  status: "queued" | "running" | "succeeded" | "failed";
  queuePosition?: number;
  createdAt: number;
  duration: number;
  batchSize: number;
  results: GenerationResult[];
  error?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  code: number;
  error: string | null;
  timestamp: number;
  extra?: any;
}

export interface ServerStats {
  jobs: {
    total: number;
    queued: number;
    running: number;
    succeeded: number;
    failed: number;
  };
  queue_size: number;
  queue_maxsize: number;
  avg_job_seconds: number;
}

export interface RandomSampleData {
  caption: string;
  lyrics: string;
  bpm?: number;
  key_scale?: string;
  time_signature?: string;
  duration?: number;
  vocal_language?: string;
}
