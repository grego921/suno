"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  BackendConfig,
  GenerationParams,
  GenerationResult,
  GenerationTask,
  ServerStats,
} from "../lib/types";
import {
  checkHealth,
  fetchAvailableModels,
  fetchServerStats,
  queryTaskStatus,
  releaseGenerationTask,
  requestFormatInput,
  requestRandomSample,
} from "../lib/api";
import {
  clearHistory,
  extractAndSaveUrlParams,
  getStoredConfig,
  getStoredHistory,
  getStoredTasks,
  removeResultFromHistory,
  saveResultToHistory,
  saveStoredConfig,
  saveStoredTasks,
} from "../lib/storage";

import { Header } from "../components/Header";
import { PromptEditor } from "../components/PromptEditor";
import { LyricsEditor } from "../components/LyricsEditor";
import { AdvancedSettings } from "../components/AdvancedSettings";
import { GenerationQueue } from "../components/GenerationQueue";
import { HistoryList } from "../components/HistoryList";
import { AudioPlayer } from "../components/AudioPlayer";
import { SettingsModal } from "../components/SettingsModal";

import { Play, Sparkles, Wand2, Zap } from "lucide-react";

export default function HomePage() {
  // Backend connection state
  const [config, setConfig] = useState<BackendConfig>({
    apiUrl: "",
    token: "",
    isConnected: false,
    isChecking: false,
    models: ["acestep-v15-turbo", "acestep-v15-base"],
    defaultModel: "acestep-v15-turbo",
  });
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Generation parameters state
  const [params, setParams] = useState<GenerationParams>({
    prompt: "",
    lyrics: "",
    isInstrumental: false,
    duration: 60,
    batchSize: 2,
    model: "acestep-v15-turbo",
    inferenceSteps: 8,
    guidanceScale: 7.0,
    seed: 42,
    useRandomSeed: true,
    bpm: undefined,
    keyScale: "auto",
    timeSignature: "auto",
    vocalLanguage: "en",
    audioFormat: "mp3",
    thinking: false,
  });

  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [isInspiring, setIsInspiring] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Tasks & History
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [history, setHistory] = useState<GenerationResult[]>([]);

  // Audio Player State
  const [currentTrack, setCurrentTrack] = useState<GenerationResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize from storage & URL params
  useEffect(() => {
    // 1. Check if ?api=... and &token=... are in URL
    extractAndSaveUrlParams();

    // 2. Load config from storage
    const storedCfg = getStoredConfig();
    setConfig(storedCfg);

    // 3. Load tasks & history
    const storedHistory = getStoredHistory();
    setHistory(storedHistory);

    const storedTasks = getStoredTasks();
    setTasks(storedTasks);

    // 4. If API URL is present, test connection immediately
    if (storedCfg.apiUrl) {
      testConnection(storedCfg.apiUrl, storedCfg.token);
    }
  }, []);

  const testConnection = async (apiUrl: string, token: string) => {
    setConfig((prev) => ({ ...prev, isChecking: true }));
    const res = await checkHealth(apiUrl, token);

    let models = ["acestep-v15-turbo", "acestep-v15-base"];
    let defaultModel = "acestep-v15-turbo";
    let serverStats: ServerStats | null = null;

    if (res.ok) {
      const modelInfo = await fetchAvailableModels(apiUrl, token);
      if (modelInfo.models.length > 0) {
        models = modelInfo.models;
        defaultModel = modelInfo.defaultModel;
        setParams((p) => ({ ...p, model: defaultModel }));
      }
      serverStats = await fetchServerStats(apiUrl, token);
      setStats(serverStats);
    }

    setConfig((prev) => ({
      ...prev,
      apiUrl,
      token,
      isConnected: res.ok,
      isChecking: false,
      latencyMs: res.latencyMs,
      error: res.error,
      models,
      defaultModel,
    }));
  };

  // Polling queue for running tasks
  useEffect(() => {
    const activeTasks = tasks.filter(
      (t) => t.status === "queued" || t.status === "running"
    );

    if (activeTasks.length === 0) return;

    const interval = setInterval(async () => {
      for (const task of activeTasks) {
        try {
          const res = await queryTaskStatus(config, task.taskId);

          if (res.status === "succeeded") {
            setTasks((prev) => {
              const updated = prev.map((t) =>
                t.id === task.id
                  ? { ...t, status: "succeeded" as const, results: res.results }
                  : t
              );
              saveStoredTasks(updated);
              return updated;
            });

            // Save results to history
            res.results.forEach((r) => {
              saveResultToHistory(r);
            });
            setHistory(getStoredHistory());

            // Auto-load first result into player if player is idle
            if (res.results.length > 0 && !currentTrack) {
              setCurrentTrack(res.results[0]);
              setIsPlaying(true);
            }
          } else if (res.status === "failed") {
            setTasks((prev) => {
              const updated = prev.map((t) =>
                t.id === task.id
                  ? { ...t, status: "failed" as const, error: res.error }
                  : t
              );
              saveStoredTasks(updated);
              return updated;
            });
          }
        } catch (e: any) {
          console.warn("Error polling task:", e);
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [tasks, config, currentTrack]);

  // Handle generation submission
  const handleGenerate = async () => {
    if (!params.prompt.trim()) {
      alert("Please enter a style or prompt description for your song.");
      return;
    }

    if (!config.apiUrl) {
      setIsSettingsOpen(true);
      return;
    }

    setIsCreating(true);
    try {
      const { taskId, queuePosition } = await releaseGenerationTask(config, params);

      const newTask: GenerationTask = {
        id: `task-${Date.now()}`,
        taskId,
        prompt: params.prompt,
        lyrics: params.isInstrumental ? "" : params.lyrics,
        status: "queued",
        queuePosition,
        createdAt: Date.now(),
        duration: params.duration,
        batchSize: params.batchSize,
        results: [],
      };

      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      saveStoredTasks(updatedTasks);
    } catch (err: any) {
      alert(`Generation failed to start: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Inspire Me / Random Sample
  const handleInspireMe = async () => {
    if (!config.apiUrl) {
      setIsSettingsOpen(true);
      return;
    }
    setIsInspiring(true);
    try {
      const sample = await requestRandomSample(config, "simple_mode");
      setParams((prev) => ({
        ...prev,
        prompt: sample.caption || prev.prompt,
        lyrics: sample.lyrics || prev.lyrics,
        bpm: sample.bpm || prev.bpm,
        keyScale: sample.key_scale || prev.keyScale,
        timeSignature: sample.time_signature || prev.timeSignature,
        duration: sample.duration || prev.duration,
        vocalLanguage: sample.vocal_language || prev.vocalLanguage,
        isInstrumental: false,
      }));
    } catch (err: any) {
      alert(`Could not fetch sample: ${err.message}`);
    } finally {
      setIsInspiring(false);
    }
  };

  // Handle AI Enhance Prompt
  const handleEnhancePrompt = async () => {
    if (!config.apiUrl) {
      setIsSettingsOpen(true);
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await requestFormatInput(
        config,
        params.prompt,
        params.lyrics,
        params.duration
      );
      setParams((prev) => ({
        ...prev,
        prompt: res.caption || prev.prompt,
        lyrics: res.lyrics || prev.lyrics,
        bpm: res.bpm || prev.bpm,
        keyScale: res.key_scale || prev.keyScale,
      }));
    } catch (err: any) {
      alert(`Could not enhance prompt: ${err.message}`);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Player handlers
  const handlePlayResult = (result: GenerationResult) => {
    if (currentTrack?.id === result.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(result);
      setIsPlaying(true);
    }
  };

  const handleSaveConfig = (apiUrl: string, token: string) => {
    saveStoredConfig({ apiUrl, token });
    testConnection(apiUrl, token);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your generation history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    removeResultFromHistory(id);
    setHistory(getStoredHistory());
  };

  const handleUsePrompt = (prompt: string, lyrics?: string) => {
    setParams((p) => ({
      ...p,
      prompt,
      lyrics: lyrics || "",
      isInstrumental: !lyrics,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-cyber-gradient text-slate-100 pb-28">
      {/* Top Header */}
      <Header
        config={config}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefreshConnection={() => testConnection(config.apiUrl, config.token)}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left / Creation Studio Panel (7 cols on lg) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Studio Panel Card */}
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5 backdrop-blur-xl shadow-2xl space-y-5">
              {/* Prompt Editor */}
              <PromptEditor
                prompt={params.prompt}
                onChange={(val) => setParams((p) => ({ ...p, prompt: val }))}
                onInspireMe={handleInspireMe}
                onEnhancePrompt={handleEnhancePrompt}
                isInspiring={isInspiring}
                isEnhancing={isEnhancing}
                disabled={isCreating}
              />

              {/* Lyrics Editor */}
              <LyricsEditor
                lyrics={params.lyrics}
                onChange={(val) => setParams((p) => ({ ...p, lyrics: val }))}
                isInstrumental={params.isInstrumental}
                onToggleInstrumental={(val) =>
                  setParams((p) => ({ ...p, isInstrumental: val }))
                }
                disabled={isCreating}
              />

              {/* Advanced Settings */}
              <AdvancedSettings
                params={params}
                onChange={(updates) => setParams((p) => ({ ...p, ...updates }))}
                availableModels={config.models}
                disabled={isCreating}
              />

              {/* Big Create Button */}
              <div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isCreating || !params.prompt.trim()}
                  className={`group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl py-4 text-base font-black uppercase tracking-wider text-slate-950 shadow-2xl transition-all ${
                    isCreating || !params.prompt.trim()
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-500 hover:shadow-neon-cyan/50 hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  {isCreating ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      <span>Submitting Task to Colab...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 fill-current" />
                      <span>Generate {params.batchSize} {params.batchSize === 1 ? "Track" : "Tracks"} ({params.duration}s)</span>
                      <Zap className="h-5 w-5 fill-current opacity-80" />
                    </>
                  )}
                </button>

                {!config.isConnected && (
                  <p className="mt-2 text-center text-xs text-amber-400/90">
                    ⚠️ Backend is not connected.{" "}
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="underline font-semibold hover:text-amber-300"
                    >
                      Click here to configure Colab URL &amp; Token
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right / Queue & History Column (5 cols on lg) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Generation Queue */}
            <GenerationQueue
              tasks={tasks}
              onPlayResult={handlePlayResult}
              activeResultId={currentTrack?.id}
              isPlaying={isPlaying}
            />

            {/* History List */}
            <HistoryList
              history={history}
              onPlayResult={handlePlayResult}
              onDeleteResult={handleDeleteHistoryItem}
              onClearHistory={handleClearHistory}
              onUsePrompt={handleUsePrompt}
              activeResultId={currentTrack?.id}
            />
          </div>
        </div>
      </main>

      {/* Persistent Audio Player */}
      <AudioPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onClose={() => {
          setIsPlaying(false);
          setCurrentTrack(null);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        stats={stats}
      />
    </div>
  );
}
