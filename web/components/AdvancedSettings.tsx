"use client";

import React, { useState } from "react";
import { GenerationParams } from "../lib/types";
import { ChevronDown, ChevronUp, Cpu, Sliders, Dices, Clock, Layers } from "lucide-react";

interface AdvancedSettingsProps {
  params: GenerationParams;
  onChange: (updates: Partial<GenerationParams>) => void;
  availableModels?: string[];
  disabled?: boolean;
}

const DURATION_PRESETS = [15, 30, 60, 90, 120, 180, 240];

const KEY_SCALES = [
  "auto",
  "C Major",
  "G Major",
  "D Major",
  "A Major",
  "E Major",
  "F Major",
  "A Minor",
  "E Minor",
  "D Minor",
  "B Minor",
  "C Minor",
];

const TIME_SIGNATURES = [
  { value: "auto", label: "Auto" },
  { value: "4", label: "4/4 (Common)" },
  { value: "3", label: "3/4 (Waltz)" },
  { value: "2", label: "2/4 (March)" },
  { value: "6", label: "6/8 (Compound)" },
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "pt", name: "Portuguese" },
  { code: "es", name: "Spanish" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "fr", name: "French" },
  { code: "ko", name: "Korean" },
  { code: "de", name: "German" },
];

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  params,
  onChange,
  availableModels = ["acestep-v15-turbo", "acestep-v15-base"],
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md">
      {/* Header bar / Quick duration & variations */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Duration Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>Duration:</span>
          </div>
          <div className="flex items-center gap-1">
            {DURATION_PRESETS.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => onChange({ duration: sec })}
                disabled={disabled}
                className={`rounded-lg px-2 py-1 text-xs font-medium transition-all ${
                  params.duration === sec
                    ? "border border-cyan-500/50 bg-cyan-500/20 text-cyan-200"
                    : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Variations (Batch size) & Toggle button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              Variations:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChange({ batchSize: count })}
                  disabled={disabled}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                    params.batchSize === count
                      ? "border border-purple-500/50 bg-purple-600/30 text-purple-200"
                      : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-white"
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span>Advanced</span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="border-t border-slate-800/80 p-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Model Selection */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                DiT Model
              </label>
              <select
                value={params.model}
                onChange={(e) => onChange({ model: e.target.value })}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-cyan-500/50 focus:outline-none"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Inference Steps */}
            <div>
              <div className="flex justify-between font-medium text-slate-300 mb-1">
                <span>Inference Steps</span>
                <span className="font-mono text-cyan-400">{params.inferenceSteps}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={params.inferenceSteps}
                onChange={(e) => onChange({ inferenceSteps: parseInt(e.target.value) || 8 })}
                disabled={disabled}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 (Fast)</span>
                <span>8 (Optimal Turbo)</span>
                <span>20 (Detailed)</span>
              </div>
            </div>

            {/* BPM Tempo */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Tempo (BPM)
              </label>
              <input
                type="number"
                min={30}
                max={300}
                placeholder="Auto (e.g. 120)"
                value={params.bpm || ""}
                onChange={(e) =>
                  onChange({ bpm: e.target.value ? parseInt(e.target.value) : undefined })
                }
                disabled={disabled}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>

            {/* Key & Scale */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Key / Scale
              </label>
              <select
                value={params.keyScale}
                onChange={(e) => onChange({ keyScale: e.target.value })}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-cyan-500/50 focus:outline-none"
              >
                {KEY_SCALES.map((k) => (
                  <option key={k} value={k}>
                    {k === "auto" ? "Auto (AI Decides)" : k}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Signature */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Time Signature
              </label>
              <select
                value={params.timeSignature}
                onChange={(e) => onChange({ timeSignature: e.target.value })}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-cyan-500/50 focus:outline-none"
              >
                {TIME_SIGNATURES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Vocal Language
              </label>
              <select
                value={params.vocalLanguage}
                onChange={(e) => onChange({ vocalLanguage: e.target.value })}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-cyan-500/50 focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Format */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Audio Output Format
              </label>
              <select
                value={params.audioFormat}
                onChange={(e) => onChange({ audioFormat: e.target.value })}
                disabled={disabled}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="mp3">MP3 (Standard 320k)</option>
                <option value="wav">WAV (Lossless 16-bit)</option>
                <option value="flac">FLAC (Lossless Compressed)</option>
                <option value="opus">OPUS (Efficient Low Bitrate)</option>
                <option value="aac">AAC (Apple Compatible)</option>
              </select>
            </div>

            {/* Seed Controller */}
            <div>
              <div className="flex items-center justify-between font-medium text-slate-300 mb-1">
                <span>Random Seed</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.useRandomSeed}
                    onChange={(e) => onChange({ useRandomSeed: e.target.checked })}
                    disabled={disabled}
                    className="rounded border-slate-700 bg-slate-800 text-cyan-400 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-400">Random</span>
                </label>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={params.useRandomSeed ? "" : params.seed}
                  onChange={(e) =>
                    onChange({
                      seed: parseInt(e.target.value) || 0,
                      useRandomSeed: false,
                    })
                  }
                  placeholder={params.useRandomSeed ? "Auto (-1)" : "Enter seed"}
                  disabled={disabled || params.useRandomSeed}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-cyan-500/50 focus:outline-none disabled:opacity-40"
                />
                {!params.useRandomSeed && (
                  <button
                    type="button"
                    onClick={() => onChange({ seed: Math.floor(Math.random() * 1000000) })}
                    disabled={disabled}
                    className="rounded-xl border border-slate-800 bg-slate-800/60 p-2 text-slate-400 hover:text-white"
                    title="Roll random seed"
                  >
                    <Dices className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Thinking Mode Switch (5Hz LM semantic token guidance) */}
          <div className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3">
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <div>
                <span className="font-semibold text-cyan-300">
                  Thinking Mode (5Hz Language Model Planning)
                </span>
                <p className="text-[11px] text-slate-400">
                  Uses the 5Hz LM to generate semantic audio codes before diffusion synthesis for enhanced song cohesion and composition.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={params.thinking}
                onChange={(e) => onChange({ thinking: e.target.checked })}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
