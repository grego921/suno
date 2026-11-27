"use client";

import React, { useState } from "react";
import { GenerationResult } from "../lib/types";
import { downloadFile } from "../lib/download";
import {
  Clock,
  Copy,
  Download,
  History,
  Play,
  Search,
  Trash2,
  Check,
} from "lucide-react";

interface HistoryListProps {
  history: GenerationResult[];
  onPlayResult: (result: GenerationResult) => void;
  onDeleteResult: (id: string) => void;
  onClearHistory: () => void;
  onUsePrompt: (prompt: string, lyrics?: string) => void;
  activeResultId?: string;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onPlayResult,
  onDeleteResult,
  onClearHistory,
  onUsePrompt,
  activeResultId,
}) => {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = history.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.prompt.toLowerCase().includes(q) ||
      (item.lyrics && item.lyrics.toLowerCase().includes(q))
    );
  });

  const handleCopyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
          <History className="h-4 w-4 text-purple-400" />
          Generation History ({history.length})
        </h3>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      {history.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved songs by prompt or lyrics..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500/50 focus:outline-none"
          />
        </div>
      )}

      {/* Track List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/20 p-6 text-center text-xs text-slate-500">
          {history.length === 0
            ? "Your generated songs will be saved in your browser here automatically."
            : "No tracks match your search."}
        </div>
      ) : (
        <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
          {filtered.map((item) => {
            const isCurrent = activeResultId === item.id;
            const dateStr = new Date(item.createdAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className={`group flex items-center justify-between gap-3 rounded-xl border p-2.5 transition-all ${
                  isCurrent
                    ? "border-cyan-500/50 bg-cyan-950/20 shadow-neon-cyan/10"
                    : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80 hover:bg-slate-900/70"
                }`}
              >
                {/* Play and Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onPlayResult(item)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-200 transition-all group-hover:bg-cyan-500 group-hover:text-slate-950"
                  >
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </button>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-200">
                      {item.prompt || "Untitled"}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{item.duration}s</span>
                      {item.bpm && <span>• {item.bpm} BPM</span>}
                      {item.keyScale && <span>• {item.keyScale}</span>}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUsePrompt(item.prompt, item.lyrics)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                    title="Reuse this prompt & lyrics"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                  <a
                    href={item.fileUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      downloadFile(item.fileUrl, `suno-track-${item.id}.mp3`);
                    }}
                    rel="noreferrer"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
                    title="Download audio"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onDeleteResult(item.id)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                    title="Delete track"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
