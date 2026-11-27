"use client";

import React from "react";
import { Mic, MicOff, Music, Trash2 } from "lucide-react";

interface LyricsEditorProps {
  lyrics: string;
  onChange: (value: string) => void;
  isInstrumental: boolean;
  onToggleInstrumental: (val: boolean) => void;
  disabled?: boolean;
}

const STRUCTURE_TAGS = [
  "[Verse 1]",
  "[Chorus]",
  "[Verse 2]",
  "[Bridge]",
  "[Outro]",
  "[Intro]",
  "[Drop]",
];

export const LyricsEditor: React.FC<LyricsEditorProps> = ({
  lyrics,
  onChange,
  isInstrumental,
  onToggleInstrumental,
  disabled,
}) => {
  const insertTag = (tag: string) => {
    if (isInstrumental) return;
    const newText = lyrics ? `${lyrics.trim()}\n\n${tag}\n` : `${tag}\n`;
    onChange(newText);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
          <Music className="h-3.5 w-3.5" />
          Lyrics & Song Structure
        </label>

        {/* Instrumental toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleInstrumental(!isInstrumental)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              isInstrumental
                ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-300"
                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            {isInstrumental ? (
              <>
                <MicOff className="h-3 w-3 text-cyan-400" />
                <span>Instrumental Mode (No Vocals)</span>
              </>
            ) : (
              <>
                <Mic className="h-3 w-3 text-purple-400" />
                <span>Vocal Mode</span>
              </>
            )}
          </button>

          {!isInstrumental && lyrics && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg p-1 text-slate-500 hover:text-rose-400 transition-colors"
              title="Clear lyrics"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isInstrumental ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
          <MicOff className="mb-2 h-8 w-8 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-300">
            Instrumental Mode Activated
          </h4>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            The model will generate pure musical composition without vocal synthesis based on your style prompt.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Tag buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 mr-1">
              Insert:
            </span>
            {STRUCTURE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => insertTag(tag)}
                disabled={disabled}
                className="rounded-md border border-purple-500/20 bg-purple-950/20 px-2 py-0.5 text-[11px] font-mono font-medium text-purple-300 hover:border-purple-500/50 hover:bg-purple-900/40 transition-all disabled:opacity-40"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Lyrics area */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-3 transition-all focus-within:border-purple-500/50 focus-within:shadow-neon-violet/20">
            <textarea
              value={lyrics}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write your lyrics here or use structure tags:&#10;&#10;[Verse 1]&#10;In neon streets the rain will fall&#10;Echoes dancing on the wall...&#10;&#10;[Chorus]&#10;Fly through the digital sky..."
              rows={6}
              disabled={disabled}
              className="w-full resize-y font-mono text-sm leading-relaxed text-slate-100 placeholder-slate-600 focus:outline-none disabled:opacity-50"
            />
            <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-500 font-mono">
              <span>{lyrics.split("\n").filter((l) => l.trim()).length} lines</span>
              <span>{lyrics.trim() ? lyrics.trim().split(/\s+/).length : 0} words</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
