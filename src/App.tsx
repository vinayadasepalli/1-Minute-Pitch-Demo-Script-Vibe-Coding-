import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ActivitySelector, ActivityMode, MODE_CONFIGS } from './components/ActivitySelector';
import { CentralMetricCards } from './components/CentralMetricCards';
import { AvoidanceTimeline } from './components/AvoidanceTimeline';
import { ExecutiveExcuseGenerator } from './components/ExecutiveExcuseGenerator';
import { HighImpactDistractions } from './components/HighImpactDistractions';
import { CameraHUD } from './components/CameraHUD';
import { InterventionModal } from './components/InterventionModal';
import { FallDetectionModal } from './components/FallDetectionModal';
import { ReturnWelcomeToast } from './components/ReturnWelcomeToast';
import { MicroSprintModal } from './components/MicroSprintModal';
import { useFaceMeshTracker } from './hooks/useFaceMeshTracker';
import { playBlip, playPanicAlert, playSuccessChime } from './utils/sound';
import { FastForward, HeartPulse, RotateCcw, MessageSquareQuote, Layers, Compass, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function App() {
  // Activity Mode: 'work' | 'game' | 'timepass'
  const [currentMode, setCurrentMode] = useState<ActivityMode>('work');
  const [avoidedTask, setAvoidedTask] = useState<string>('Writing Q3 Strategy RFC');

  // Active Tab for demo simplicity
  const [activeTab, setActiveTab] = useState<'excuses' | 'distractions' | 'timeline'>('excuses');

  // Timers in seconds (Gaze: 1800s, Immobility: 1200s)
  const [gazeSeconds, setGazeSeconds] = useState<number>(0);
  const [immobilitySeconds, setImmobilitySeconds] = useState<number>(0);

  // Intervention & Break States
  const [isInterventionOpen, setIsInterventionOpen] = useState<boolean>(false);
  const [hasInterventionTriggered, setHasInterventionTriggered] = useState<boolean>(false);
  const [isReturnWelcomeOpen, setIsReturnWelcomeOpen] = useState<boolean>(false);
  const [isMicroSprintOpen, setIsMicroSprintOpen] = useState<boolean>(false);
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null);

  // Fall Detection State
  const [isFallModalOpen, setIsFallModalOpen] = useState<boolean>(false);

  // Video element & Stream state from CameraHUD
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // User away tracking
  const [awaySeconds, setAwaySeconds] = useState<number>(0);

  // MediaPipe Face Mesh Tracker Hook
  const tracker = useFaceMeshTracker(videoElement, !!mediaStream);

  const {
    noseTip,
    deltaPos,
    userStatus,
    isLookingAtScreen,
    gazeDirection,
    landmarks,
    isFaceDetected,
    isSuddenDropDetected,
    triggerSuddenDrop,
    clearSuddenDrop,
    setSimulatedFaceAway,
  } = tracker;

  // Watch for sudden drop detection
  useEffect(() => {
    if (isSuddenDropDetected && !isFallModalOpen) {
      setIsFallModalOpen(true);
    }
  }, [isSuddenDropDetected, isFallModalOpen]);

  // Handle mode switch
  const handleSelectMode = (mode: ActivityMode) => {
    setCurrentMode(mode);
    setAvoidedTask(MODE_CONFIGS[mode].defaultTask);
  };

  // Track away duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isFaceDetected) {
      interval = setInterval(() => {
        setAwaySeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setAwaySeconds(0);
    }
    return () => clearInterval(interval);
  }, [isFaceDetected]);

  // Main 1-second biometrics accumulation loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (isInterventionOpen || isFallModalOpen) return;

      // "Gaze Time": increments every second user is looking towards screen (target: 30m)
      if (isLookingAtScreen) {
        setGazeSeconds((prev) => prev + 1);
      }

      // "Immobility Time": increments continuously while user is marked "STATIC" (target: 20m)
      if (userStatus === 'STATIC') {
        setImmobilitySeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isInterventionOpen, isFallModalOpen, isLookingAtScreen, userStatus]);

  // Check intervention threshold
  useEffect(() => {
    if (
      (gazeSeconds >= 1800 || immobilitySeconds >= 1200) &&
      !isInterventionOpen &&
      !hasInterventionTriggered &&
      !isFallModalOpen
    ) {
      playPanicAlert();
      setIsInterventionOpen(true);
      setHasInterventionTriggered(true);
    }
  }, [gazeSeconds, immobilitySeconds, isInterventionOpen, hasInterventionTriggered, isFallModalOpen]);

  // Fast-Forward Demo: Sets Gaze to 29:55 and Immobility to 19:55 (fires live in 5s)
  const triggerFastForward = useCallback(() => {
    playPanicAlert();
    setGazeSeconds(1795); // 29m 55s
    setImmobilitySeconds(1195); // 19m 55s
    setHasInterventionTriggered(false);
    setShortcutFeedback('⏩ Fast-Forward: Set to 29:55 & 19:55 (Fires live in 5s!)');
    setTimeout(() => setShortcutFeedback(null), 3500);
  }, []);

  // Reset all timers back to 00:00
  const resetAllTimers = useCallback(() => {
    playBlip(380);
    setGazeSeconds(0);
    setImmobilitySeconds(0);
    setIsInterventionOpen(false);
    setHasInterventionTriggered(false);
    setIsReturnWelcomeOpen(false);
    clearSuddenDrop();
    setIsFallModalOpen(false);
    setShortcutFeedback('🔄 All Timers Reset to 00:00');
    setTimeout(() => setShortcutFeedback(null), 2500);
  }, [clearSuddenDrop]);

  // Keyboard Shortcuts: 'D' for Fast-Forward, 'R' for Reset, 'F' for Fall test
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        triggerFastForward();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetAllTimers();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        triggerSuddenDrop();
        setIsFallModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerFastForward, resetAllTimers, triggerSuddenDrop]);

  // Handle completion of physical reset
  const handleCompleteReset = useCallback(() => {
    setIsInterventionOpen(false);
    setImmobilitySeconds(0);
    setGazeSeconds((prev) => Math.max(0, prev - 600));
    setHasInterventionTriggered(false);

    setTimeout(() => {
      setIsReturnWelcomeOpen(true);
      playSuccessChime();
    }, 400);
  }, []);

  const currentAvoidanceMins = Math.floor(gazeSeconds / 60);
  const currentAvoidanceSecs = gazeSeconds % 60;
  const formattedTime = `${currentAvoidanceMins
    .toString()
    .padStart(2, '0')}:${currentAvoidanceSecs.toString().padStart(2, '0')}`;

  const isPanicMode = gazeSeconds >= 1740 || immobilitySeconds >= 1140;
  const isUpright = (noseTip?.y ?? 1) < 0.65 && isFaceDetected;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200 antialiased font-sans">
      {/* Toast Feedback Banner */}
      {shortcutFeedback && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-4 py-1.5 rounded-full bg-slate-900/95 border border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.4)] text-amber-300 font-mono text-xs font-bold backdrop-blur-md flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{shortcutFeedback}</span>
          </div>
        </div>
      )}

      {/* 1. Header (Title, Subtitle with avoided task, Fast-Forward Button) */}
      <Header
        avoidedTask={avoidedTask}
        setAvoidedTask={setAvoidedTask}
        isPanicMode={isPanicMode}
        onFastForward={triggerFastForward}
        onReset={resetAllTimers}
        formattedTime={formattedTime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 pb-24 space-y-3.5">
        {/* Simple Demo Action Strip */}
        <section aria-label="Demo Controls" className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
          {/* Left: Mode Picker */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-mono text-slate-400 font-semibold hidden sm:inline">
              Mode:
            </span>
            <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 gap-1 w-full sm:w-auto justify-center">
              {(Object.keys(MODE_CONFIGS) as ActivityMode[]).map((mode) => {
                const cfg = MODE_CONFIGS[mode];
                const isSelected = currentMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      playBlip(600);
                      handleSelectMode(mode);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? mode === 'work'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                          : mode === 'game'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Instant Pitch Demo Triggers */}
          <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
            <button
              onClick={triggerFastForward}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Jump to 29:55 so the 30m break triggers live in 5s"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Fast-Forward [D] (Fires in 5s)</span>
            </button>

            <button
              onClick={() => {
                triggerSuddenDrop();
                setIsFallModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Test sudden drop / emergency family call trigger"
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              <span>🚨 Test Fall Alert [F]</span>
            </button>

            <button
              onClick={resetAllTimers}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
              title="Reset all timers to 00:00"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>[R]</span>
            </button>
          </div>
        </section>

        {/* 2. Central Metric Cards: Gaze Time & Immobility Time */}
        <CentralMetricCards
          gazeSeconds={gazeSeconds}
          immobilitySeconds={immobilitySeconds}
          isLookingAtScreen={isLookingAtScreen}
          userStatus={userStatus}
          deltaPos={deltaPos}
          gazeDirection={gazeDirection}
          isPanicMode={isPanicMode}
          mode={currentMode}
        />

        {/* 3. Simple Tabbed Content Area for Demo Convenience */}
        <section aria-label="Interactive Demo Tools" className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm shadow-md">
          {/* Tab Headers */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4 overflow-x-auto">
            <button
              onClick={() => {
                playBlip(540);
                setActiveTab('excuses');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'excuses'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {currentMode === 'game' ? '🎮 Squad Pause Messages' : currentMode === 'timepass' ? '🍿 Reality Checks' : '💬 Plausible Excuses'}
              </span>
            </button>

            <button
              onClick={() => {
                playBlip(540);
                setActiveTab('distractions');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'distractions'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>📋 Activities & Distractions Log</span>
            </button>

            <button
              onClick={() => {
                playBlip(540);
                setActiveTab('timeline');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>⏱️ 30-Min Trajectory</span>
            </button>
          </div>

          {/* Tab Body */}
          {activeTab === 'excuses' && (
            <ExecutiveExcuseGenerator
              avoidedTask={avoidedTask}
              isPanicMode={isPanicMode}
              mode={currentMode}
            />
          )}

          {activeTab === 'distractions' && (
            <HighImpactDistractions mode={currentMode} />
          )}

          {activeTab === 'timeline' && (
            <AvoidanceTimeline
              seconds={gazeSeconds}
              onSeek={(secs) => {
                playBlip(540);
                setGazeSeconds(secs);
              }}
              isPanicMode={isPanicMode}
            />
          )}
        </section>
      </main>

      {/* 4. Bottom-Right HUD: Picture-in-Picture with glowing green pill & ΔMotion */}
      <CameraHUD
        isPanicMode={isPanicMode}
        onVideoElementReady={(video, stream) => {
          setVideoElement(video);
          setMediaStream(stream);
        }}
        landmarks={landmarks}
        noseTip={noseTip}
        deltaPos={deltaPos}
        userStatus={userStatus}
        isFaceDetected={isFaceDetected}
        isLookingAtScreen={isLookingAtScreen}
      />

      {/* 5. Intervention Modal: Triggered at 30m Gaze or 20m Immobility */}
      <InterventionModal
        isOpen={isInterventionOpen}
        onClose={() => setIsInterventionOpen(false)}
        onCompleteReset={handleCompleteReset}
        isFaceDetected={isFaceDetected}
        awaySeconds={awaySeconds}
        onSimulateWalkAway={() => {
          playSuccessChime();
          setSimulatedFaceAway(true);
        }}
      />

      {/* 6. Sudden Drop / Fall Emergency Modal */}
      <FallDetectionModal
        isOpen={isFallModalOpen}
        onDismiss={() => {
          clearSuddenDrop();
          setIsFallModalOpen(false);
        }}
        isUpright={isUpright}
      />

      {/* 7. Return Welcome Toast */}
      <ReturnWelcomeToast
        isOpen={isReturnWelcomeOpen}
        onClose={() => setIsReturnWelcomeOpen(false)}
        avoidedTask={avoidedTask}
        onStartMicroSprint={() => setIsMicroSprintOpen(true)}
      />

      {/* 8. 2-Minute Micro-Sprint Sandbox Modal */}
      <MicroSprintModal
        isOpen={isMicroSprintOpen}
        onClose={() => setIsMicroSprintOpen(false)}
        avoidedTask={avoidedTask}
      />
    </div>
  );
}
