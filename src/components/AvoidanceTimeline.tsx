import React from 'react';
import { Flame, ShieldAlert, Sparkles, Compass, AlertOctagon } from 'lucide-react';

interface AvoidanceTimelineProps {
  seconds: number;
  onSeek: (seconds: number) => void;
  isPanicMode: boolean;
}

export const AvoidanceTimeline: React.FC<AvoidanceTimelineProps> = ({
  seconds,
  onSeek,
  isPanicMode,
}) => {
  const maxSeconds = 1800; // 30 mins
  const progressPercent = Math.min(100, (seconds / maxSeconds) * 100);

  const stages = [
    {
      title: 'Phase 1: Innocent Micro-Tasking',
      time: '0m - 10m',
      desc: '"Just organizing inbox and getting coffee first."',
      startSec: 0,
      color: 'border-emerald-500/40 text-emerald-400',
    },
    {
      title: 'Phase 2: Architectural Rabbit Hole',
      time: '10m - 20m',
      desc: '"Maybe I need to update my Neovim Lua config first."',
      startSec: 600,
      color: 'border-cyan-500/40 text-cyan-400',
    },
    {
      title: 'Phase 3: The Deep Cleanse',
      time: '20m - 28m',
      desc: '"Wiping monitor, ordering new desk mat on Amazon."',
      startSec: 1200,
      color: 'border-amber-500/40 text-amber-400',
    },
    {
      title: 'Phase 4: CRITICAL PANIC HORIZON',
      time: '29m - 30m',
      desc: '"Meeting starts in 60s. Need plausible emergency excuse."',
      startSec: 1740, // 29m
      color: 'border-rose-500/70 text-rose-400 bg-rose-950/20',
    },
  ];

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-mono">
            Avoidance Telemetry & Panic Trajectory
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>Current Stage:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              isPanicMode
                ? 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse'
                : seconds >= 1200
                ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-200'
            }`}
          >
            {seconds >= 1740
              ? 'STAGE 4: TERMINAL PANIC'
              : seconds >= 1200
              ? 'STAGE 3: THE DEEP CLEANSE'
              : seconds >= 600
              ? 'STAGE 2: RABBIT HOLE'
              : 'STAGE 1: PRODUCTIVE DELUSION'}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative mt-2 mb-4">
        {/* Track Bar */}
        <div className="h-3 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden relative shadow-inner cursor-pointer"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const clickX = e.clientX - rect.left;
               const ratio = Math.max(0, Math.min(1, clickX / rect.width));
               onSeek(Math.floor(ratio * maxSeconds));
             }}
        >
          {/* Active fill */}
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isPanicMode
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                : 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />

          {/* 29m Critical line marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] z-10"
            style={{ left: `${(1740 / maxSeconds) * 100}%` }}
            title="29m Deadline Drop"
          />
        </div>

        {/* Labels under track */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1.5 px-0.5">
          <span>00:00 (Start of RFC block)</span>
          <span>15:00 (Midpoint delusion)</span>
          <span className="text-rose-400 font-bold">29:00 (Jump Target)</span>
          <span>30:00 (Sync Review)</span>
        </div>
      </div>

      {/* 4 Interactive Phase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {stages.map((stage, idx) => {
          const isActive =
            (idx === 0 && seconds < 600) ||
            (idx === 1 && seconds >= 600 && seconds < 1200) ||
            (idx === 2 && seconds >= 1200 && seconds < 1740) ||
            (idx === 3 && seconds >= 1740);

          return (
            <button
              key={stage.title}
              onClick={() => onSeek(stage.startSec)}
              className={`p-3 rounded-lg border text-left transition-all relative ${
                isActive
                  ? `${stage.color} bg-slate-800/80 shadow-md ring-1 ring-slate-700`
                  : 'border-slate-800/90 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="font-semibold">{stage.time}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                )}
              </div>
              <div className="text-xs font-semibold text-slate-200 mb-1 leading-snug">
                {stage.title}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                {stage.desc}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
