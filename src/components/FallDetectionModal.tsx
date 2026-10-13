import React, { useState, useEffect } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, CheckCircle2, User, Phone, X, HeartPulse, Clock, Sparkles } from 'lucide-react';
import { playEmergencyAlarm, playPhoneRing, playSuccessChime, playBlip } from '../utils/sound';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

const DEFAULT_FAMILY_CONTACTS: EmergencyContact[] = [
  { id: 'c1', name: 'Mom / Family Lead', relationship: 'Primary Family', phone: '+1 (555) 019-2834' },
  { id: 'c2', name: 'Partner / Spouse', relationship: 'Secondary Family', phone: '+1 (555) 014-9821' },
];

interface FallDetectionModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  isUpright: boolean;
}

export const FallDetectionModal: React.FC<FallDetectionModalProps> = ({
  isOpen,
  onDismiss,
  isUpright,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>(DEFAULT_FAMILY_CONTACTS);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [editingContact, setEditingContact] = useState<boolean>(false);

  // When modal opens, start 60s countdown
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(60);
      setIsCalling(false);
      setCallDuration(0);
      playEmergencyAlarm();
    }
  }, [isOpen]);

  // 60-second countdown
  useEffect(() => {
    if (!isOpen || isCalling) return;

    // Periodic warning beep every 4s
    const soundInterval = setInterval(() => {
      playEmergencyAlarm();
    }, 4000);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          clearInterval(soundInterval);
          setIsCalling(true);
          playPhoneRing();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(soundInterval);
    };
  }, [isOpen, isCalling]);

  // Phone ringing & call duration timer once call starts
  useEffect(() => {
    if (!isCalling) return;

    const ringInterval = setInterval(() => {
      playPhoneRing();
    }, 4500);

    const callTimer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(ringInterval);
      clearInterval(callTimer);
    };
  }, [isCalling]);

  if (!isOpen) return null;

  const handleImOk = () => {
    playSuccessChime();
    onDismiss();
  };

  const primaryContact = contacts[0] || DEFAULT_FAMILY_CONTACTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn font-sans">
      <div
        className={`relative w-full max-w-lg rounded-2xl border p-6 sm:p-7 backdrop-blur-2xl shadow-2xl transition-all ${
          isCalling
            ? 'bg-rose-950/90 border-rose-500/80 shadow-[0_0_60px_rgba(244,63,94,0.4)] ring-2 ring-rose-500/50'
            : 'bg-slate-900/95 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.35)] ring-1 ring-amber-500/40'
        } text-white`}
      >
        {!isCalling ? (
          /* STEP 1: 1-MINUTE EMERGENCY COUNTDOWN & OK BUTTON */
          <div className="flex flex-col items-center text-center">
            {/* Warning Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold tracking-wider uppercase mb-3 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Sudden Drop / Fall Detected</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              Are you okay?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mb-4 font-sans">
              We detected a sudden downward drop within 1–2 seconds. If you are not back up within{' '}
              <strong className="text-rose-400 font-bold">1 minute</strong> and click the OK button, an
              emergency call will be placed to your family members.
            </p>

            {/* Huge 60s Countdown Display */}
            <div className="my-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 w-full flex flex-col items-center justify-center">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                Emergency Call Dispatch In:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-amber-400">
                  {secondsRemaining.toString().padStart(2, '0')}s
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-1000 rounded-full"
                  style={{ width: `${(secondsRemaining / 60) * 100}%` }}
                />
              </div>

              {/* Upright posture detection tip */}
              <div className="mt-2.5 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                {isUpright ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Upright posture detected! Click OK to cancel alert.
                  </span>
                ) : (
                  <span>Camera: User not yet detected upright</span>
                )}
              </div>
            </div>

            {/* Target Family Member to be called */}
            <div className="w-full my-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs text-left">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-full bg-rose-500/20 text-rose-400">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200">
                    Emergency Contact: {primaryContact.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {primaryContact.phone} ({primaryContact.relationship})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingContact(!editingContact)}
                className="text-[10px] text-cyan-400 hover:underline font-mono"
              >
                {editingContact ? 'Close' : 'Edit Number'}
              </button>
            </div>

            {/* Quick Contact Editor */}
            {editingContact && (
              <div className="w-full mb-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex gap-2">
                <input
                  type="text"
                  value={primaryContact.phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContacts((prev) => [{ ...prev[0], phone: val }, ...prev.slice(1)]);
                  }}
                  className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  placeholder="Enter Family Phone..."
                />
                <button
                  onClick={() => setEditingContact(false)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                >
                  Done
                </button>
              </div>
            )}

            {/* REQUIRED OK BUTTON */}
            <div className="w-full flex flex-col gap-2 mt-2">
              <button
                onClick={handleImOk}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-base tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>I AM OK — CANCEL EMERGENCY</span>
              </button>

              <button
                onClick={() => {
                  setIsCalling(true);
                  playPhoneRing();
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-mono underline py-1 cursor-pointer"
              >
                Test Calling Family Members Immediately
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: ACTIVE EMERGENCY CALL SCREEN */
          <div className="flex flex-col items-center text-center">
            {/* Calling animation ring */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute w-28 h-28 rounded-full border-2 border-rose-500/40 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-rose-600/30 border border-rose-500/70 flex items-center justify-center text-rose-300 shadow-[0_0_35px_rgba(244,63,94,0.6)]">
                <PhoneCall className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>DIALING EMERGENCY FAMILY MEMBERS</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Calling: {primaryContact.name}
            </h3>
            <p className="text-sm font-mono text-slate-300 mb-4">
              {primaryContact.phone}
            </p>

            <div className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-left mb-5 space-y-2 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Call Status:</span>
                <span className="text-emerald-400 font-bold">RINGING (00:{callDuration.toString().padStart(2, '0')})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Incident Packet:</span>
                <span className="text-cyan-400">Transmitting GPS + Camera</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Automated Voice Audio:</span>
                <span className="text-slate-300">"Urgent fall detected. Please respond."</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              {/* Native Dial link fallback */}
              <a
                href={`tel:${primaryContact.phone.replace(/[^0-9+]/g, '')}`}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Open in Phone App ({primaryContact.phone})</span>
              </a>

              <button
                onClick={handleImOk}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>I Am Safe — End Emergency Call</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
