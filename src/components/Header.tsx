import React, { useState } from 'react';
import { FastForward, RotateCcw, Edit2, Check, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { playBlip, playPanicAlert, playSuccessChime } from '../utils/sound';

interface HeaderProps {
  avoidedTask: string;
  setAvoidedTask: (task: string) => void;
  isPanicMode: boolean;
  onFastForward: () => void;
  onReset: () => void;
  formattedTime: string;
  onOpenGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  avoidedTask,
  setAvoidedTask,
  isPanicMode,
  onFastForward,
  onReset,
  formattedTime,
  onOpenGuide,
}) => {
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskDraft, setTaskDraft] = useState(avoidedTask);

  const handleSaveTask = () => {
    if (taskDraft.trim()) {
      setAvoidedTask(taskDraft.trim());
      playSuccessChime();
    }
    setIsEditingTask(false);
  };

  const handleFastForwardClick = () => {
    if (!isPanicMode) {
      playPanicAlert();
    } else {
      playBlip(440);
    }
    onFastForward();
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          {/* Left: Title & Avoided Task Subtitle */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-sans">
                <span className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]">⚡</span>
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  The Procrastination Assistant
                </span>
              </h1>

              {/* Status Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide uppercase transition-all ${
                  isPanicMode
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse'
                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPanicMode ? 'bg-rose-400' : 'bg-emerald-400'
                  }`}
                />
                <span>{isPanicMode ? 'STAGE 4: DEFCON 1' : 'PASSIVE AVOIDANCE'}</span>
              </div>
            </div>

            {/* Subtitle showing avoided task */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              <span className="text-slate-400 font-medium font-mono text-xs">Avoided Task:</span>

              {isEditingTask ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={taskDraft}
                    onChange={(e) => setTaskDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTask();
                      if (e.key === 'Escape') setIsEditingTask(false);
                    }}
                    autoFocus
                    className="px-2 py-0.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400 font-medium"
                  />
                  <button
                    onClick={handleSaveTask}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <span className="font-semibold text-slate-200 bg-slate-900/80 px-2.5 py-0.5 rounded border border-slate-800 group-hover:border-slate-700 transition-colors">
                    {avoidedTask}
                  </span>
                  <button
                    onClick={() => {
                      setTaskDraft(avoidedTask);
                      setIsEditingTask(true);
                      playBlip(600);
                    }}
                    className="text-slate-400 hover:text-slate-300 transition-colors opacity-70 group-hover:opacity-100"
                    title="Edit task name"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-slate-400 text-xs hidden sm:inline font-mono">
                P0 Strategic Priority
              </span>
            </div>
          </div>

          {/* Right: Telemetry Counter & Fast-Forward Demo Button */}
          <div className="flex items-center gap-2 sm:gap-3 self-start md:self-auto flex-wrap">
            {/* Avoidance Timer Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-xs shadow-inner">
              <Clock
                className={`w-3.5 h-3.5 ${
                  isPanicMode ? 'text-rose-400 animate-spin' : 'text-slate-400'
                }`}
              />
              <div className="flex flex-col leading-none">
                <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
                  Avoidance Clock
                </span>
                <span
                  className={`text-sm font-bold tracking-tight ${
                    isPanicMode ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {formattedTime}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">/ 30:00</span>
                </span>
              </div>
            </div>

            {/* Real-Life Playbook Button */}
            {onOpenGuide && (
              <button
                onClick={() => {
                  playBlip(600);
                  onOpenGuide();
                }}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-xs font-sans font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Real-Life Workstation & Ergonomics Guide"
              >
                <span className="text-sm">📖</span>
                <span className="hidden sm:inline">Real-Life Guide</span>
              </button>
            )}

            {/* REQUIRED BUTTON: Top-right button labeled "⏩ Fast-Forward Demo (Jump to 29m)" */}
            <button
              onClick={handleFastForwardClick}
              className={`relative group inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer ${
                isPanicMode
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-rose-400/50'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>
                {isPanicMode
                  ? '⏩ Fast-Forward Demo (Jump to 29m)'
                  : '⏩ Fast-Forward Demo (Jump to 29m)'}
              </span>
              {isPanicMode && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
              )}
            </button>

            {/* Reset button if fast-forwarded */}
            {isPanicMode && (
              <button
                onClick={() => {
                  playBlip(380);
                  onReset();
                }}
                className="px-2.5 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-mono flex items-center gap-1 transition-all"
                title="Rewind to 0m"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
