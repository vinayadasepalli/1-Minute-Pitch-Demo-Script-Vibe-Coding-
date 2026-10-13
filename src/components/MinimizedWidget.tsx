import React from 'react';
import { Maximize2, Sparkles, Clock, Activity, Eye, HeartPulse, FastForward, RotateCcw } from 'lucide-react';
import { playBlip } from '../utils/sound';
import { ActivityMode, MODE_CONFIGS } from './ActivitySelector';

interface MinimizedWidgetProps {
  avoidedTask: string;
  currentMode: ActivityMode;
  gazeSeconds: number;
  immobilitySeconds: number;
  isLookingAtScreen: boolean;
  userStatus: 'STATIC' | 'ACTIVE';
  isPanicMode: boolean;
  deltaPos: number;
  onMaximize: () => void;
  onFastForward: () => void;
  onReset: () => void;
  onTriggerFall: () => void;
}

function formatMinutesSeconds(totalSecs: number): string {
  const mins = Math.floor(totalSecs / 60);
  const secs = Math.floor(totalSecs % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const MinimizedWidget: React.FC<MinimizedWidgetProps> = ({
  avoidedTask,
  currentMode,
  gazeSeconds,
  immobilitySeconds,
  isLookingAtScreen,
  userStatus,
  isPanicMode,
  deltaPos,
  onMaximize,
  onFastForward,
  onReset,
  onTriggerFall,
}) => {
  const gazePercent = Math.min(100, (gazeSeconds / 1800) * 100);
  const immobilityPercent = Math.min(100, (immobilitySeconds / 1200) * 100);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slideDown font-sans select-none max-w-xl w-[92%] sm:w-auto">
      {/* Minimized Dock Bar */}
      <div
        className={`relative flex items-center justify-between gap-3 sm:gap-4 px-3 sm:px-4 py-2 rounded-2xl border shadow-2xl backdrop-blur-2xl transition-all ${
          isPanicMode
            ? 'bg-rose-950/90 border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.4)] ring-1 ring-rose-500/50'
            : 'bg-slate-900/90 border-slate-700/80 shadow-[0_15px_35px_rgba(0,0,0,0.8)]'
        } text-white`}
      >
        {/* Left: Brand & Task */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-amber-400 text-sm">⚡</span>
            <span className="text-xs font-bold font-sans tracking-tight hidden md:inline">
              Assistant
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {currentMode === 'work' ? '💼' : currentMode === 'game' ? '🎮' : '🍿'}
            </span>
          </div>

          <div className="truncate max-w-[120px] sm:max-w-[180px] text-xs font-semibold text-slate-200" title={avoidedTask}>
            {avoidedTask}
          </div>
        </div>

        {/* Center: Live Timers */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Gaze Timer */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <Eye
                className={`w-3 h-3 ${
                  isLookingAtScreen ? 'text-emerald-400' : 'text-slate-500'
                }`}
              />
              <span className="font-bold text-slate-100">
                {formatMinutesSeconds(gazeSeconds)}
              </span>
            </div>
            <div className="w-12 h-1 bg-slate-950 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${gazePercent}%` }}
              />
            </div>
          </div>

          {/* Immobility Timer */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <Activity
                className={`w-3 h-3 ${
                  userStatus === 'STATIC' ? 'text-cyan-400' : 'text-amber-400'
                }`}
              />
              <span className="font-bold text-slate-100">
                {formatMinutesSeconds(immobilitySeconds)}
              </span>
            </div>
            <div className="w-12 h-1 bg-slate-950 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${immobilityPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick actions & MAXIMIZE CORNER BUTTON */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              playBlip(780);
              onFastForward();
            }}
            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs transition-all cursor-pointer hidden sm:flex"
            title="Fast Forward to 29:55"
          >
            <FastForward className="w-3 h-3" />
          </button>

          <button
            onClick={() => {
              playBlip(440);
              onTriggerFall();
            }}
            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs transition-all cursor-pointer hidden sm:flex"
            title="Test Fall Alert"
          >
            <HeartPulse className="w-3 h-3" />
          </button>

          {/* TOP CORNER RESTORE / MAXIMIZE ICON */}
          <button
            onClick={() => {
              playBlip(640);
              onMaximize();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            title="Restore full screen dashboard"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expand</span>
          </button>
        </div>
      </div>

      <div className="text-center mt-1">
        <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800 backdrop-blur-sm">
          Screen Minimized • Background Biometric Mesh Active
        </span>
      </div>
    </div>
  );
};
