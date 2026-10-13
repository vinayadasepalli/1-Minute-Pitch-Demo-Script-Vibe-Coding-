import React from 'react';
import { Eye, Activity, Target, Zap, CheckCircle2, User, HelpCircle } from 'lucide-react';
import { ActivityMode } from './ActivitySelector';

interface CentralMetricCardsProps {
  gazeSeconds: number;
  immobilitySeconds: number;
  isLookingAtScreen: boolean;
  userStatus: 'STATIC' | 'ACTIVE';
  deltaPos: number;
  gazeDirection: string;
  isPanicMode: boolean;
  mode?: ActivityMode;
}

function formatMinutesSeconds(totalSecs: number): string {
  const mins = Math.floor(totalSecs / 60);
  const secs = Math.floor(totalSecs % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const CentralMetricCards: React.FC<CentralMetricCardsProps> = ({
  gazeSeconds,
  immobilitySeconds,
  isLookingAtScreen,
  userStatus,
  deltaPos,
  gazeDirection,
  isPanicMode,
  mode = 'work',
}) => {
  const GAZE_TARGET_SECS = 1800; // 30 minutes
  const IMMOBILITY_TARGET_SECS = 1200; // 20 minutes

  const gazeProgressPercent = Math.min(100, (gazeSeconds / GAZE_TARGET_SECS) * 100);
  const immobilityProgressPercent = Math.min(100, (immobilitySeconds / IMMOBILITY_TARGET_SECS) * 100);

  const isStatic = userStatus === 'STATIC';

  // Mode-specific friendly tips
  const modeGazeTip =
    mode === 'game'
      ? 'Intense gaming focus detected • Prevents dry eye strain'
      : mode === 'timepass'
      ? 'Passive screen gaze detected • Catches mindless scrolling'
      : 'Working gaze detected • Breaks deep procrastination lock';

  const modeImmobilityTip =
    mode === 'game'
      ? 'Frozen posture in gaming chair • Prevents wrist & neck stiffness'
      : mode === 'timepass'
      ? 'Lounge / couch lock detected • Encourages standing up'
      : 'Desk slouch detected • Prompts healthy blood circulation';

  return (
    <section aria-label="Biometric Distraction Timers" className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 my-4">
      {/* CARD 1: Gaze Time (Target: 30m) */}
      <div
        className={`relative overflow-hidden rounded-xl border bg-slate-900/80 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-all ${
          isPanicMode
            ? 'border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40'
            : isLookingAtScreen
            ? 'border-slate-800 hover:border-emerald-500/40'
            : 'border-slate-800 hover:border-amber-500/40'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg border ${
                isLookingAtScreen
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Gaze Time
                </h2>
                <span className="text-xs font-mono text-slate-400 font-medium">
                  (Target: 30m)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                {modeGazeTip}
              </p>
            </div>
          </div>

          {/* User-friendly status badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border transition-all ${
              isLookingAtScreen
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLookingAtScreen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{isLookingAtScreen ? 'EYES ON SCREEN' : 'LOOKING AWAY'}</span>
          </div>
        </div>

        {/* Big Numbers & Simple Progress */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
              {formatMinutesSeconds(gazeSeconds)}
            </span>
            <span className="text-xs font-mono text-slate-400">
              / 30:00 limit
            </span>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs font-bold text-emerald-400">
              {gazeProgressPercent.toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-400 block">accumulated</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="relative w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden shadow-inner mb-3">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isPanicMode
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
            }`}
            style={{ width: `${gazeProgressPercent}%` }}
          />
        </div>

        {/* Plain-English Easy Explainer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-sans">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direction: <strong className="text-slate-200">{gazeDirection}</strong></span>
          </span>
          <span className="text-slate-400">
            Counts when your face is oriented toward the monitor
          </span>
        </div>
      </div>

      {/* CARD 2: Immobility Time (Target: 20m) */}
      <div
        className={`relative overflow-hidden rounded-xl border bg-slate-900/80 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-all ${
          isPanicMode
            ? 'border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40'
            : isStatic
            ? 'border-slate-800 hover:border-cyan-500/40'
            : 'border-slate-800 hover:border-amber-500/40'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg border ${
                isStatic
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Immobility Time
                </h2>
                <span className="text-xs font-mono text-slate-400 font-medium">
                  (Target: 20m)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                {modeImmobilityTip}
              </p>
            </div>
          </div>

          {/* User-friendly status badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition-all ${
              isStatic
                ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isStatic ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{isStatic ? 'STATUS: STATIC' : 'STATUS: ACTIVE'}</span>
          </div>
        </div>

        {/* Big Numbers & Simple Progress */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
              {formatMinutesSeconds(immobilitySeconds)}
            </span>
            <span className="text-xs font-mono text-slate-400">
              / 20:00 limit
            </span>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs font-bold text-cyan-400">
              {immobilityProgressPercent.toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-400 block">accumulated</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="relative w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden shadow-inner mb-3">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isPanicMode
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                : 'bg-gradient-to-r from-cyan-500 to-sky-400 shadow-[0_0_10px_rgba(6,182,212,0.35)]'
            }`}
            style={{ width: `${immobilityProgressPercent}%` }}
          />
        </div>

        {/* Plain-English Easy Explainer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-sans">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nose ΔPos: <strong className={deltaPos < 0.015 ? 'text-cyan-300' : 'text-amber-300'}>{deltaPos.toFixed(3)}</strong></span>
          </span>
          <span className="text-slate-400">
            {isStatic ? 'You are sitting very still (freeze mode)' : 'Movement detected (active)'}
          </span>
        </div>
      </div>
    </section>
  );
};
