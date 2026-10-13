import React, { useState } from 'react';
import { Sparkles, CheckCircle2, X, ArrowRight, Zap, Target } from 'lucide-react';
import { playBlip, playSuccessChime } from '../utils/sound';

interface ReturnWelcomeToastProps {
  isOpen: boolean;
  onClose: () => void;
  avoidedTask: string;
  onStartMicroSprint: () => void;
}

export const ReturnWelcomeToast: React.FC<ReturnWelcomeToastProps> = ({
  isOpen,
  onClose,
  avoidedTask,
  onStartMicroSprint,
}) => {
  const [selectedWin, setSelectedWin] = useState<string | null>(null);

  if (!isOpen) return null;

  const lowFrictionWins = [
    'Write just 1 sentence defining the problem statement.',
    'List 3 bullet points with placeholder names.',
    'Create the Google Doc link and send to 1 peer for async notes.',
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-md w-full animate-slideUp font-sans">
      <div className="relative rounded-2xl bg-slate-900/95 border border-emerald-500/40 p-4 sm:p-5 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] ring-1 ring-emerald-500/30 text-white">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
              Physical Reset Completed
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* EXACT REQUIRED TEXT */}
        <p className="text-sm font-medium text-slate-100 leading-snug mb-3">
          Welcome back! Momentum restored. Ready for a 2-minute micro-start on your task, or pick a low-friction secondary win?
        </p>

        {/* Action Choice Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            onClick={() => {
              playSuccessChime();
              onStartMicroSprint();
              onClose();
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono shadow-md transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2-Min Micro-Start</span>
          </button>

          <button
            onClick={() => {
              playBlip(600);
              setSelectedWin((prev) => (prev ? null : lowFrictionWins[0]));
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-all"
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Secondary Win</span>
          </button>
        </div>

        {/* Low-Friction Wins Accordion */}
        {selectedWin && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono animate-fadeIn">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
              Select Low-Friction Action:
            </span>
            <div className="space-y-1.5">
              {lowFrictionWins.map((win) => (
                <button
                  key={win}
                  onClick={() => {
                    playSuccessChime();
                    setSelectedWin(win);
                    setTimeout(() => onClose(), 1500);
                  }}
                  className={`w-full text-left p-2 rounded border transition-all text-[11px] flex items-center justify-between ${
                    selectedWin === win
                      ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200 font-semibold'
                      : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{win}</span>
                  {selectedWin === win && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
