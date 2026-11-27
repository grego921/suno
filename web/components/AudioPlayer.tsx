"use client";

import React, { useEffect, useRef, useState } from "react";
import { GenerationResult } from "../lib/types";
import { downloadFile } from "../lib/download";
import {
  Download,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Repeat,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

interface AudioPlayerProps {
  currentTrack: GenerationResult | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onClose,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Sync audio play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn("Audio play prevented:", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle track change
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.src = currentTrack.fileUrl;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying) {
      audioRef.current.play().catch((e) => console.warn("Auto-play error:", e));
    }
  }, [currentTrack]);

  // Audio element event listeners
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || currentTrack?.duration || 0);
    }
  };

  const onEnded = () => {
    if (!isLooping) {
      onPlayPause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.85;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Canvas Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const renderWave = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const numBars = 48;
      const barWidth = width / numBars - 2;
      const progressRatio = duration > 0 ? currentTime / duration : 0;

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + 2);
        const barRatio = i / numBars;
        const isPassed = barRatio <= progressRatio;

        // Dynamic height modulation based on sine waves and play state
        let scale = Math.sin(i * 0.4 + (isPlaying ? Date.now() * 0.006 : 0)) * 0.35 + 0.55;
        if (!isPlaying) scale = Math.sin(i * 0.4) * 0.25 + 0.4;

        const barHeight = Math.max(4, scale * height * 0.85);
        const y = (height - barHeight) / 2;

        if (isPassed) {
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, "#00f2fe");
          grad.addColorStop(1, "#9333ea");
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = "rgba(100, 116, 139, 0.35)";
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      if (isPlaying) {
        animId = requestAnimationFrame(renderWave);
      }
    };

    renderWave();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, currentTime, duration]);

  if (!currentTrack) return null;

  const formatTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-cyan-500/20 bg-slate-950/85 px-4 py-3 backdrop-blur-2xl shadow-2xl">
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        loop={isLooping}
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Track Info */}
        <div className="flex items-center gap-3 sm:w-1/4">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-neon-cyan/30">
            <Play className={`h-5 w-5 text-slate-950 ${isPlaying ? "animate-pulse" : ""}`} />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-xs font-bold text-slate-100 sm:text-sm">
              {currentTrack.prompt || "Generated Track"}
            </h4>
            <p className="truncate text-[11px] text-slate-400">
              Var #{currentTrack.variationIndex} • {currentTrack.bpm ? `${currentTrack.bpm} BPM` : "Auto"} • Seed {currentTrack.seed || "random"}
            </p>
          </div>
        </div>

        {/* Center Waveform & Controls */}
        <div className="flex flex-1 flex-col items-center gap-1.5 sm:max-w-xl">
          {/* Controls Bar */}
          <div className="flex items-center gap-4">
            {/* Loop Toggle */}
            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={`rounded-lg p-1.5 transition-colors ${
                isLooping ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Toggle Loop"
            >
              <Repeat className="h-4 w-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={onPlayPause}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 shadow-neon-cyan/40 transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Download Link */}
            <a
              href={currentTrack.fileUrl}
              onClick={(e) => {
                e.preventDefault();
                downloadFile(currentTrack.fileUrl, `suno-track-${currentTrack.id}.mp3`);
              }}
              rel="noreferrer"
              className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
              title="Download Audio"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>

          {/* Canvas Waveform & Scrubbing Slider */}
          <div className="relative w-full flex items-center gap-2">
            <span className="w-10 text-right font-mono text-[10px] text-slate-400">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 h-6 flex items-center">
              <canvas
                ref={canvasRef}
                width={380}
                height={24}
                className="w-full h-6 pointer-events-none"
              />
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                title="Seek audio position"
              />
            </div>

            <span className="w-10 font-mono text-[10px] text-slate-400">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume & Close */}
        <div className="hidden sm:flex sm:items-center sm:gap-3 sm:w-1/4 sm:justify-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-rose-400" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 accent-cyan-400"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-900 hover:text-slate-200 transition-colors"
            title="Close player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
