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
import { AlertTriangle, Sparkles, ShieldCheck, HeartPulse } from 'lucide-react';

export default function App() {
  // Activity Mode: 'work' | 'game' | 'timepass'
  const [currentMode, setCurrentMode] = useState<ActivityMode>('work');
  const [avoidedTask, setAvoidedTask] = useState<string>('Writing Q3 Strategy RFC');

  // Timers in seconds
  // Gaze target: 1800s (30m), Immobility target: 1200s (20m)
  const [gazeSeconds, setGazeSeconds] = useState<number>(0);
  const [immobilitySeconds, setImmobilitySeconds] = useState<number>(0);

  // Intervention & Break States
  const [isInterventionOpen, setIsInterventionOpen] = useState<boolean>(false);
  const [hasInterventionTriggered, setHasInterventionTriggered] = useState<boolean>(false);
  const [isReturnWelcomeOpen, setIsReturnWelcomeOpen] = useState<boolean>(false);
  const [isMicroSprintOpen, setIsMicroSprintOpen] = useState<boolean>(false);
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null);

  // Sudden Fall / Drop State
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
      // Pause timers if intervention or fall alert is active
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

  // Check intervention threshold:
  // When Gaze Time >= 30m (1800s) OR Immobility Time >= 20m (1200s), trigger intervention modal
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

  // Fast-Forward Demo: Sets Gaze to 29:55 and Immobility to 19:55
  const triggerFastForward = useCallback(() => {
    playPanicAlert();
    setGazeSeconds(1795); // 29m 55s
    setImmobilitySeconds(1195); // 19m 55s
    setHasInterventionTriggered(false);
    setShortcutFeedback('⏩ Fast-Forward: Set to 29:55 & 19:55 (fires live in 5s!)');
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
    setShortcutFeedback('🔄 Timers reset to 00:00');
    setTimeout(() => setShortcutFeedback(null), 2500);
  }, [clearSuddenDrop]);

  // Keyboard Shortcuts: 'D' for Fast-Forward, 'R' for Reset
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerFastForward, resetAllTimers]);

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
      {/* Shortcut Feedback Banner */}
      {shortcutFeedback && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-amber-300 font-mono text-xs font-bold backdrop-blur-md flex items-center gap-2">
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

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 pb-24 space-y-4">
        {/* NEW: Lightweight Activity Selector [Work | Game | Time Pass] */}
        <ActivitySelector
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          avoidedTask={avoidedTask}
          onSelectTaskPreset={(preset) => {
            setAvoidedTask(preset);
            playSuccessChime();
          }}
        />

        {/* Live Pitch & Safety Testing Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-3.5 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-slate-300 font-semibold">Active Mesh:</span>
            <span className="text-slate-400">
              Nose Tip #1 • 200ms Inference • Fall & Immobility Guard
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] flex-wrap">
            {/* Fall Simulation Trigger for testing */}
            <button
              onClick={() => {
                triggerSuddenDrop();
                setIsFallModalOpen(true);
              }}
              className="px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-mono transition-colors cursor-pointer"
              title="Test sudden drop / fall alert"
            >
              <HeartPulse className="w-3 h-3 text-rose-400" />
              <span>Simulate Drop (1s Fall)</span>
            </button>

            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
              [D] Jump (5s)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
              [R] Reset
            </span>
          </div>
        </div>

        {/* 2. Central Metric Cards: Gaze Time & Immobility Time with Dynamic Progress Bars */}
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

        {/* 3. Avoidance Telemetry & Timeline Track */}
        <AvoidanceTimeline
          seconds={gazeSeconds}
          onSeek={(secs) => {
            playBlip(540);
            setGazeSeconds(secs);
          }}
          isPanicMode={isPanicMode}
        />

        {/* 4. Lower Dashboard Grid: Excuses Generator & Distractions Log (adapted to Work, Game, Time Pass) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <ExecutiveExcuseGenerator
            avoidedTask={avoidedTask}
            isPanicMode={isPanicMode}
            mode={currentMode}
          />

          <HighImpactDistractions mode={currentMode} />
        </div>
      </main>

      {/* 5. Bottom-Right HUD: ~180px Webcam Picture-in-Picture with glowing green pill & ΔMotion */}
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

      {/* 6. Intervention Modal: Triggered at 30m Gaze or 20m Immobility */}
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

      {/* 7. Sudden Drop / Fall Emergency Modal (Calls family if not up in 1 min or OK clicked) */}
      <FallDetectionModal
        isOpen={isFallModalOpen}
        onDismiss={() => {
          clearSuddenDrop();
          setIsFallModalOpen(false);
        }}
        isUpright={isUpright}
      />

      {/* 8. Return Welcome Toast */}
      <ReturnWelcomeToast
        isOpen={isReturnWelcomeOpen}
        onClose={() => setIsReturnWelcomeOpen(false)}
        avoidedTask={avoidedTask}
        onStartMicroSprint={() => setIsMicroSprintOpen(true)}
      />

      {/* 9. 2-Minute Micro-Sprint Sandbox Modal */}
      <MicroSprintModal
        isOpen={isMicroSprintOpen}
        onClose={() => setIsMicroSprintOpen(false)}
        avoidedTask={avoidedTask}
      />
    </div>
  );
}
