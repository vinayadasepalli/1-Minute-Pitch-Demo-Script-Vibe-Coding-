import React, { useState, useEffect } from 'react';
import { Droplet, DoorOpen, Eye, CheckCircle2, Wind, Sparkles, UserX, UserCheck, X } from 'lucide-react';
import { playBlip, playSuccessChime } from '../utils/sound';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteReset: () => void;
  isFaceDetected: boolean;
  awaySeconds: number;
  onSimulateWalkAway: () => void;
}

type ActionType = 'water' | 'stretch' | 'horizon' | null;

export const InterventionModal: React.FC<InterventionModalProps> = ({
  isOpen,
  onClose,
  onCompleteReset,
  isFaceDetected,
  awaySeconds,
  onSimulateWalkAway,
}) => {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  // Reset internal states when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedAction(null);
      setCountdown(60);
    }
  }, [isOpen]);

  // 60-second countdown timer once an action is selected
  useEffect(() => {
    if (!isOpen || !selectedAction) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          playSuccessChime();
          onCompleteReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, selectedAction, onCompleteReset]);

  // Ambient breathing rhythm cycle (4s Inhale, 4s Hold, 4s Exhale)
  useEffect(() => {
    if (!isOpen || !selectedAction) return;

    const breathInterval = setInterval(() => {
      const cycleTime = (60 - countdown) % 12;
      if (cycleTime < 4) {
        setBreathPhase('Inhale');
      } else if (cycleTime < 8) {
        setBreathPhase('Hold');
      } else {
        setBreathPhase('Exhale');
      }
    }, 500);

    return () => clearInterval(breathInterval);
  }, [isOpen, selectedAction, countdown]);

  // Requirement: Auto-Detection when camera detects NO face landmarks for >5 seconds
  useEffect(() => {
    if (isOpen && awaySeconds >= 5) {
      playSuccessChime();
      onCompleteReset();
    }
  }, [isOpen, awaySeconds, onCompleteReset]);

  if (!isOpen) return null;

  const handleSelectAction = (action: ActionType) => {
    setSelectedAction(action);
    setCountdown(60);
    playBlip(720);
  };

  const actionDetails = {
    water: { title: '💧 Refill Water', tip: 'Hydrate brain tissue, lubricate vocal cords for the review.' },
    stretch: { title: '🚪 Doorway Stretch', tip: 'Open chest, release thoracic tension from slouched posture.' },
    horizon: { title: '🪟 Horizon Scan', tip: 'Look at an object 20+ feet away to release ciliary eye spasm.' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Centered glowing glassmorphic card with indigo-950 backdrop blur */}
      <div className="relative w-full max-w-lg rounded-2xl bg-indigo-950/90 border border-indigo-500/40 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_60px_rgba(99,102,241,0.35)] ring-1 ring-indigo-400/30 text-white transition-all overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Close button (optional bypass) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {!selectedAction ? (
          /* STEP 1: Modal Announcement & 3 Action Buttons */
          <div className="flex flex-col items-center text-center">
            {/* Warning pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-semibold tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <span>⚠️ Physical Reset Required</span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-white font-sans">
              Break the Avoidance Freeze
            </h2>

            {/* EXACT REQUIRED COPY */}
            <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed mb-6 max-w-md">
              You&apos;ve been locked at your screen without moving for 30 minutes. Break the avoidance freeze.
            </p>

            {/* 3 Interactive Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-6">
              <button
                onClick={() => handleSelectAction('water')}
                className="group relative flex flex-col items-center justify-center p-3.5 rounded-xl bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-400/30 hover:border-indigo-400/70 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md"
              >
                <div className="p-2.5 rounded-full bg-blue-500/20 text-blue-300 mb-2 group-hover:scale-110 transition-transform">
                  <Droplet className="w-5 h-5" />
                </div>
                <span className="font-semibold text-xs text-white">💧 Refill Water</span>
                <span className="text-[10px] text-indigo-300/80 mt-1">Get up to faucet</span>
              </button>

              <button
                onClick={() => handleSelectAction('stretch')}
                className="group relative flex flex-col items-center justify-center p-3.5 rounded-xl bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-400/30 hover:border-indigo-400/70 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md"
              >
                <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-300 mb-2 group-hover:scale-110 transition-transform">
                  <DoorOpen className="w-5 h-5" />
                </div>
                <span className="font-semibold text-xs text-white">🚪 Doorway Stretch</span>
                <span className="text-[10px] text-indigo-300/80 mt-1">Release posture</span>
              </button>

              <button
                onClick={() => handleSelectAction('horizon')}
                className="group relative flex flex-col items-center justify-center p-3.5 rounded-xl bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-400/30 hover:border-indigo-400/70 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md"
              >
                <div className="p-2.5 rounded-full bg-cyan-500/20 text-cyan-300 mb-2 group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="font-semibold text-xs text-white">🪟 Horizon Scan</span>
                <span className="text-[10px] text-indigo-300/80 mt-1">20-20-20 rule</span>
              </button>
            </div>

            {/* Live Camera "User Away" Presence Detection indicator */}
            <div className="w-full p-3 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                {isFaceDetected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-indigo-200 text-[11px]">
                      Face detected in frame • Step away to complete
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-emerald-300 text-[11px] font-bold">
                      User away ({awaySeconds}s / 5s to auto-complete)
                    </span>
                  </>
                )}
              </div>

              {/* Pitch shortcut button */}
              <button
                onClick={onSimulateWalkAway}
                className="px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-[10px] flex items-center gap-1 transition-all"
                title="Fast demo trigger for pitch"
              >
                <UserX className="w-3 h-3" />
                <span>Simulate Step Away (5s)</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: 60-Second Countdown with Ambient Breathing Animation Circle */
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-300 mb-1">
              Active Intervention Protocol
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {actionDetails[selectedAction]?.title}
            </h3>
            <p className="text-xs text-indigo-200/80 mb-6 max-w-sm">
              {actionDetails[selectedAction]?.tip}
            </p>

            {/* Ambient Breathing Animation Circle */}
            <div className="relative flex items-center justify-center my-4">
              {/* Outer pulsing ring */}
              <div
                className={`absolute w-44 h-44 rounded-full border-2 border-indigo-400/30 transition-all duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'scale-125 opacity-80 border-cyan-400/50'
                    : breathPhase === 'Hold'
                    ? 'scale-125 opacity-100 border-indigo-400/60 shadow-[0_0_30px_rgba(99,102,241,0.4)]'
                    : 'scale-90 opacity-40 border-indigo-500/20'
                }`}
              />

              {/* Glowing breathing core */}
              <div
                className={`w-36 h-36 rounded-full bg-gradient-to-tr from-indigo-600/40 via-cyan-500/30 to-indigo-400/40 backdrop-blur-md flex flex-col items-center justify-center border border-indigo-400/50 shadow-inner transition-all duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'scale-110 shadow-[0_0_35px_rgba(6,182,212,0.5)]'
                    : breathPhase === 'Hold'
                    ? 'scale-110 shadow-[0_0_40px_rgba(99,102,241,0.6)]'
                    : 'scale-95 shadow-none'
                }`}
              >
                <span className="text-3xl font-extrabold font-mono tracking-tight text-white drop-shadow">
                  {countdown}s
                </span>
                <span className="text-[11px] font-mono font-semibold tracking-wider text-cyan-300 uppercase mt-0.5 animate-pulse">
                  {breathPhase}
                </span>
              </div>
            </div>

            {/* Presence auto-detection during breathing */}
            <div className="w-full mt-6 p-3 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                {!isFaceDetected ? (
                  <span className="text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Physical reset in progress (User away: {awaySeconds}s / 5s)
                  </span>
                ) : (
                  <span className="text-indigo-200 text-[11px]">
                    Step away from desk for full reset credit
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSimulateWalkAway}
                  className="px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-[10px]"
                >
                  Simulate Away
                </button>
                <button
                  onClick={() => {
                    playSuccessChime();
                    onCompleteReset();
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-[11px] transition-colors"
                >
                  Complete Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
