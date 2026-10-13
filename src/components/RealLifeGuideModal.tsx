import React, { useState, useEffect } from 'react';
import { BookOpen, X, Monitor, Eye, DoorOpen, Droplet, HeartPulse, CheckCircle2, Play, Pause, Sparkles, Smartphone, ChevronRight } from 'lucide-react';
import { playBlip, playSuccessChime } from '../utils/sound';

interface RealLifeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMicroSprint?: () => void;
}

export const RealLifeGuideModal: React.FC<RealLifeGuideModalProps> = ({
  isOpen,
  onClose,
  onStartMicroSprint,
}) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'workflows' | 'ergonomics' | 'emergency'>('workflows');
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerLabel, setTimerLabel] = useState<string>('');

  // Built-in mini coach timer for 20-20-20 or Doorway stretch
  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev === null || prev <= 1) {
          playSuccessChime();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  if (!isOpen) return null;

  const startErgonomicTimer = (seconds: number, label: string) => {
    playBlip(720);
    setTimerLabel(label);
    setTimerSeconds(seconds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl flex flex-col text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Real-World Playbook & Daily Guide
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Best practices for desk ergonomics, solo safety, and breaking screen trances.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-slate-800/80 overflow-x-auto shrink-0">
          <button
            onClick={() => {
              playBlip(540);
              setActiveTab('workflows');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'workflows'
                ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
            }`}
          >
            <span>💼 Daily Workflows</span>
          </button>

          <button
            onClick={() => {
              playBlip(540);
              setActiveTab('ergonomics');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ergonomics'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
            }`}
          >
            <span>🧘 Interactive Ergonomics</span>
          </button>

          <button
            onClick={() => {
              playBlip(540);
              setActiveTab('setup');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'setup'
                ? 'bg-slate-800 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
            }`}
          >
            <span>🖥️ Desk & Camera Setup</span>
          </button>

          <button
            onClick={() => {
              playBlip(540);
              setActiveTab('emergency');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'emergency'
                ? 'bg-slate-800 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
            }`}
          >
            <span>🚨 Lone Worker Safety</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
          {/* TAB 1: WORKFLOWS */}
          {activeTab === 'workflows' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">💼</span>
                  <h3 className="font-bold text-sm text-emerald-300">
                    1. Deep Work & Intimidating Tasks
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                  Procrastination isn&apos;t laziness—it&apos;s emotional regulation in response to high activation energy.
                </p>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-white">Name the avoided deliverable directly:</strong> Type the specific task in the header (*e.g., &quot;Writing Q3 Strategy RFC&quot;*).
                  </li>
                  <li>
                    <strong className="text-white">Use the 2-Minute Micro-Sprint:</strong> When the 30-minute freeze alerts trigger, take your physical break and then accept the 2-minute prompt. Committing to just 120 seconds breaks blank-page paralysis.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">🎮</span>
                  <h3 className="font-bold text-sm text-purple-300">
                    2. Long Gaming Sessions
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                  Competitive games induce extreme catatonic focus (&quot;gamer slouch&quot;), leading to thoracic compression and dry eye strain.
                </p>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-white">Turn on 🎮 Game Mode:</strong> Monitors for continuous static posture between queues.
                  </li>
                  <li>
                    <strong className="text-white">Squad Etiquette:</strong> Copy 1-click pause excuses (*e.g., &quot;Grabbing water and stretching wrists before next round&quot;*) to keep your squad aligned.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">🍿</span>
                  <h3 className="font-bold text-sm text-amber-300">
                    3. Doomscroll Circuit-Breaker
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When browsing infinite feeds or video platforms, switch to <strong>🍿 Time Pass</strong> mode. When the app detects 30 minutes of locked gaze, it forces an ambient breathing break before hours vanish.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE ERGONOMICS */}
          {activeTab === 'ergonomics' && (
            <div className="space-y-4">
              {/* Active Timer Pill if running */}
              {timerSeconds !== null && (
                <div className="p-3.5 rounded-xl border border-cyan-500/50 bg-cyan-950/40 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Active Coach: <strong>{timerLabel}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold font-mono text-white">{timerSeconds}s</span>
                    <button
                      onClick={() => setTimerSeconds(null)}
                      className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 20-20-20 Rule Card */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between">
                  <div>
                    <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 w-fit mb-2">
                      <Eye className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-200 mb-1">
                      20-20-20 Horizon Scan
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Every 20 minutes, look at an object 20 feet away for 20 seconds. This releases tension in your eye ciliary muscles.
                    </p>
                  </div>
                  <button
                    onClick={() => startErgonomicTimer(20, '20-20-20 Horizon Scan')}
                    className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start 20s Scan</span>
                  </button>
                </div>

                {/* Doorway Stretch Card */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between">
                  <div>
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 w-fit mb-2">
                      <DoorOpen className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-200 mb-1">
                      Doorway Chest Stretch
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Place hands on a doorframe at shoulder level and step forward gently for 15 seconds. Counteracts rounded desk shoulders.
                    </p>
                  </div>
                  <button
                    onClick={() => startErgonomicTimer(15, '15s Doorway Stretch')}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start 15s Stretch</span>
                  </button>
                </div>

                {/* Small Glass Trick Card */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between">
                  <div>
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 w-fit mb-2">
                      <Droplet className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-200 mb-1">
                      The Smaller Glass Trick
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Avoid a giant 2-liter water jug at your desk. A 250ml glass forces you to get up and walk to the kitchen naturally every 40 minutes.
                    </p>
                  </div>
                  <div className="py-2 px-3 rounded-lg bg-slate-800/80 text-blue-300 text-center font-mono text-xs">
                    💡 Micro-Habit Hack
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETUP */}
          {activeTab === 'setup' && (
            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                <h4 className="font-bold text-sm text-slate-100 mb-2 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  Dual-Monitor & Split Screen Recommendation
                </h4>
                <p className="mb-2">
                  Snap <strong>The Procrastination Assistant</strong> into a side pane (*e.g., 20% width of your secondary display or right half of your laptop*).
                </p>
                <p>
                  You do not need to keep the webcam visible. Clicking the <strong>Minimize</strong> button in the bottom-right HUD collapses the video into a subtle telemetry pill while full tracking continues.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                <h4 className="font-bold text-sm text-slate-100 mb-2">
                  Webcam Height & Lighting
                </h4>
                <p className="mb-2">
                  Position your camera approximately at eye level. Standard ambient desk lighting ensures MediaPipe Face Mesh tracks the nose tip ($Index\ \#1$) without optical jitter.
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Zero video or biometrics are ever sent over the network.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LONE WORKER SAFETY */}
          {activeTab === 'emergency' && (
            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  <h4 className="font-bold text-sm text-rose-300">
                    Solo Remote Worker Ambient Safety Net
                  </h4>
                </div>
                <p className="mb-2">
                  If you work from home alone, sudden faint episodes, blood pressure drops from standing up too fast, or chair collapses can leave you incapacitated.
                </p>
                <p className="mb-3">
                  The app tracks vertical velocity in real time: a 1–2 second downward drop initiates a 60-second safety countdown with an audible siren. If you do not click OK or recover into an upright posture, automated family emergency dispatch begins.
                </p>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-400">
                    Test the emergency protocol now:
                  </span>
                  <span className="font-mono text-rose-400 font-bold">
                    Press [F] or click &quot;🚨 Test Fall Alert&quot;
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
          <span className="text-slate-400">
            Keyboard Demo: <strong className="text-amber-300">[D]</strong> 5s Break • <strong className="text-rose-300">[F]</strong> Fall Alert
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-medium transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
