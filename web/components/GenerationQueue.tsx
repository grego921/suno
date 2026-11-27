"use client";

import React, { useEffect, useState } from "react";
import { GenerationResult, GenerationTask } from "../lib/types";
import { downloadFile } from "../lib/download";
import { Activity, AlertCircle, CheckCircle2, Clock, Download, Play, Sparkles } from "lucide-react";

interface GenerationQueueProps {
  tasks: GenerationTask[];
  onPlayResult: (result: GenerationResult) => void;
  activeResultId?: string;
  isPlaying?: boolean;
}

export const GenerationQueue: React.FC<GenerationQueueProps> = ({
  tasks,
  onPlayResult,
  activeResultId,
  isPlaying,
}) => {
  const activeTasks = tasks.filter(
    (t) => t.status === "queued" || t.status === "running"
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
          <Activity className="h-4 w-4 text-cyan-400" />
          Generation Queue & Results
        </h3>
        {activeTasks.length > 0 && (
          <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            {activeTasks.length} in progress
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-8 text-center text-slate-500">
          <Sparkles className="mb-2 h-8 w-8 text-slate-700" />
          <p className="text-sm font-medium">No songs generated yet</p>
          <p className="text-xs text-slate-600 mt-1">
            Write a prompt, choose your duration, and click Create Music to start!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPlayResult={onPlayResult}
              activeResultId={activeResultId}
              isPlaying={isPlaying}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TaskCardProps {
  task: GenerationTask;
  onPlayResult: (result: GenerationResult) => void;
  activeResultId?: string;
  isPlaying?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPlayResult,
  activeResultId,
  isPlaying,
}) => {
  const [elapsed, setElapsed] = useState(
    Math.floor((Date.now() - task.createdAt) / 1000)
  );

  useEffect(() => {
    if (task.status === "succeeded" || task.status === "failed") return;

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - task.createdAt) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [task.createdAt, task.status]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-slate-700/80">
      {/* Task Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                task.status === "succeeded"
                  ? "border border-emerald-500/30 bg-emerald-950/40 text-emerald-400"
                  : task.status === "failed"
                  ? "border border-rose-500/30 bg-rose-950/40 text-rose-400"
                  : "border border-cyan-500/30 bg-cyan-950/40 text-cyan-400"
              }`}
            >
              {task.status === "succeeded"
                ? "Ready"
                : task.status === "failed"
                ? "Failed"
                : task.status === "queued"
                ? `Queued (${task.queuePosition || 1})`
                : "Synthesizing..."}
            </span>
            <span className="text-xs font-mono text-slate-500">
              {formatSeconds(elapsed)}
            </span>
            <span className="text-xs text-slate-500">• {task.duration}s</span>
            <span className="text-xs text-slate-500">• {task.batchSize} {task.batchSize === 1 ? "track" : "tracks"}</span>
          </div>

          <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">
            {task.prompt || "Untitled Composition"}
          </h4>

          {task.lyrics && (
            <p className="text-xs text-slate-400 line-clamp-1 font-mono italic">
              &quot;{task.lyrics.slice(0, 100)}...&quot;
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar for Running Tasks */}
      {(task.status === "queued" || task.status === "running") && (
        <div className="mt-3 space-y-2">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-600 animate-pulse" />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Running diffusion inference on Colab GPU...</span>
            <span className="font-mono">{elapsed}s</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {task.status === "failed" && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{task.error || "Generation error. Please check your Colab notebook session."}</span>
        </div>
      )}

      {/* Results grid */}
      {task.status === "succeeded" && task.results.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {task.results.map((result) => {
            const isCurrent = activeResultId === result.id;
            return (
              <div
                key={result.id}
                className={`group flex items-center justify-between rounded-xl border p-2.5 transition-all ${
                  isCurrent
                    ? "border-cyan-500/50 bg-cyan-950/30 shadow-neon-cyan/20"
                    : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onPlayResult(result)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform active:scale-95 ${
                      isCurrent && isPlaying
                        ? "bg-cyan-400 text-slate-950 shadow-neon-cyan/50"
                        : "bg-slate-800 text-slate-200 group-hover:bg-cyan-500 group-hover:text-slate-950"
                    }`}
                  >
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </button>

                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      Variation #{result.variationIndex}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {result.duration}s • {result.bpm ? `${result.bpm} BPM` : "Auto BPM"} • Seed {result.seed || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href={result.fileUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      downloadFile(result.fileUrl, `suno-${result.id}.mp3`);
                    }}
                    rel="noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    title="Download track"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
