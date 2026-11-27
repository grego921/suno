"use client";

import React from "react";
import { BackendConfig } from "../lib/types";
import { Activity, CheckCircle2, Disc, Github, Settings, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  config: BackendConfig;
  onOpenSettings: () => void;
  onRefreshConnection: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenSettings,
  onRefreshConnection,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-neon-cyan/40">
            <Disc className="h-5 w-5 animate-spin-slow text-black" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400 opacity-20 blur-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-xl font-black tracking-wider text-transparent">
                SUNO
              </span>
              <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-300">
                ACE-STEP 1.5
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              Futuristic AI Music Generation
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Connection status pill */}
          <button
            onClick={config.isConnected ? onOpenSettings : onOpenSettings}
            className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
              config.isConnected
                ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:border-emerald-500/60"
                : config.isChecking
                ? "border-amber-500/30 bg-amber-950/40 text-amber-300 hover:border-amber-500/60"
                : "border-rose-500/40 bg-rose-950/40 text-rose-300 hover:border-rose-500/70"
            }`}
            title="Click to manage backend connection"
          >
            {config.isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="hidden sm:inline">Colab Connected</span>
                <span className="sm:hidden">Online</span>
                {config.latencyMs !== undefined && (
                  <span className="text-[10px] text-emerald-400/80">
                    {config.latencyMs}ms
                  </span>
                )}
              </>
            ) : config.isChecking ? (
              <>
                <Activity className="h-3 w-3 animate-spin text-amber-400" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-rose-400" />
                <span className="hidden sm:inline">Backend Offline</span>
                <span className="sm:hidden">Connect</span>
              </>
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 transition-all hover:border-cyan-500/40 hover:text-cyan-400"
            title="API & System Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* GitHub repo */}
          <a
            href="https://github.com/grego921/suno"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 transition-all hover:border-purple-500/40 hover:text-purple-400 sm:flex"
            title="GitHub Repository"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
