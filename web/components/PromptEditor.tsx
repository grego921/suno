"use client";

import React, { useState } from "react";
import { Sparkles, Wand2, RefreshCw } from "lucide-react";

interface PromptEditorProps {
  prompt: string;
  onChange: (value: string) => void;
  onInspireMe: () => void;
  onEnhancePrompt: () => void;
  isInspiring: boolean;
  isEnhancing: boolean;
  disabled?: boolean;
}

const PRESET_TAGS = [
  "Cyberpunk",
  "Synthwave",
  "80s Retro",
  "Pop Rock",
  "Lo-Fi Hip Hop",
  "Cinematic Orchestral",
  "EDM Anthem",
  "Heavy Metal",
  "Acoustic Folk",
  "Anime OST",
  "Future Bass",
  "Chillout Ambient",
  "Darkwave",
  "R&B Soul",
  "Jazz Fusion",
];

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onChange,
  onInspireMe,
  onEnhancePrompt,
  isInspiring,
  isEnhancing,
  disabled,
}) => {
  const addTag = (tag: string) => {
    if (!prompt.trim()) {
      onChange(tag);
      return;
    }
    const lowerPrompt = prompt.toLowerCase();
    if (!lowerPrompt.includes(tag.toLowerCase())) {
      onChange(`${prompt.trim()}, ${tag}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
          <Sparkles className="h-3.5 w-3.5" />
          Music Style & Prompt
        </label>
        <div className="flex items-center gap-2">
          {/* Enhance button */}
          <button
            type="button"
            onClick={onEnhancePrompt}
            disabled={disabled || isEnhancing || !prompt.trim()}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/30 px-2.5 py-1 text-xs font-medium text-purple-300 transition-all hover:border-purple-500/60 hover:bg-purple-900/40 disabled:opacity-40"
            title="Use ACE-Step LLM to refine and format your prompt"
          >
            {isEnhancing ? (
              <RefreshCw className="h-3 w-3 animate-spin text-purple-400" />
            ) : (
              <Wand2 className="h-3 w-3 text-purple-400" />
            )}
            <span>Enhance</span>
          </button>

          {/* Inspire Me button */}
          <button
            type="button"
            onClick={onInspireMe}
            disabled={disabled || isInspiring}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-2.5 py-1 text-xs font-medium text-cyan-300 transition-all hover:border-cyan-500/60 hover:bg-cyan-900/40 disabled:opacity-40"
            title="Fetch a curated random sample prompt and lyrics"
          >
            {isInspiring ? (
              <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
            ) : (
              <Sparkles className="h-3 w-3 text-cyan-400" />
            )}
            <span>Inspire Me</span>
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-3 transition-all focus-within:border-cyan-500/50 focus-within:shadow-neon-cyan/20">
        <textarea
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your track style, genre, instruments, and vibe (e.g., upbeat cyberpunk synthwave with energetic electric guitar and driving bass)..."
          rows={3}
          disabled={disabled}
          className="w-full resize-none bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
        />

        {/* Character count / helper */}
        <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
          <span>Click tags below to append genres and instruments</span>
          <span className="font-mono text-slate-500">{prompt.length} chars</span>
        </div>
      </div>

      {/* Quick tag chips */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_TAGS.map((tag) => {
          const isSelected = prompt.toLowerCase().includes(tag.toLowerCase());
          return (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? "border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-sm shadow-cyan-500/10"
                  : "border border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              +{tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};
