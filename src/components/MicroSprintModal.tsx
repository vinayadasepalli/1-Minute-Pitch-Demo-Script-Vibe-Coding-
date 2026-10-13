import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Copy, Check, Sparkles, X, FileText, Send } from 'lucide-react';
import { playBlip, playSuccessChime } from '../utils/sound';

interface MicroSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  avoidedTask: string;
}

export const MicroSprintModal: React.FC<MicroSprintModalProps> = ({
  isOpen,
  onClose,
  avoidedTask,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [isActive, setIsActive] = useState(true);
  const [content, setContent] = useState(
    `# ${avoidedTask} — Quick RFC Outline\n\n1. Problem Definition:\n- \n\n2. Proposed Strategic Pillars:\n- \n\n3. Key Metric / Success Metric:\n- `
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(120);
      setIsActive(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isActive) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          playSuccessChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isActive]);

  if (!isOpen) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins}:${secs.toString().padStart(2, '0')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    playSuccessChime();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-emerald-500/40 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl text-white">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  2-Minute Micro-Sprint
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono text-[10px]">
                  Zero Pressure Sandbox
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Kickstart: {avoidedTask}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-sm font-bold text-emerald-400">
              <span>{timeFormatted}</span>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Textarea for micro-draft */}
        <div className="relative mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs sm:text-sm font-mono text-slate-200 resize-none focus:outline-none leading-relaxed"
            placeholder="Type anything to break the blank-page freeze..."
            autoFocus
          />
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>The goal is not perfection, just momentum!</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsActive(!isActive)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1 transition-all"
            >
              {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isActive ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Draft' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
