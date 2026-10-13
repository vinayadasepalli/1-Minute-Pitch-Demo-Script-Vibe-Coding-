import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ShieldCheck, RefreshCw, Eye, EyeOff, Activity, Maximize2, Minimize2 } from 'lucide-react';
import { LandmarkPoint } from '../hooks/useFaceMeshTracker';
import { playBlip } from '../utils/sound';

interface CameraHUDProps {
  isPanicMode?: boolean;
  onVideoElementReady: (video: HTMLVideoElement | null, stream: MediaStream | null) => void;
  landmarks: LandmarkPoint[] | null;
  noseTip: LandmarkPoint | null;
  deltaPos: number;
  userStatus: 'STATIC' | 'ACTIVE';
  isFaceDetected: boolean;
  isLookingAtScreen: boolean;
}

export const CameraHUD: React.FC<CameraHUDProps> = ({
  isPanicMode = false,
  onVideoElementReady,
  landmarks,
  noseTip,
  deltaPos,
  userStatus,
  isFaceDetected,
  isLookingAtScreen,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showMeshOverlay, setShowMeshOverlay] = useState<boolean>(true);
  const [motionDelta, setMotionDelta] = useState<string>('0.00');
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);

  // Initialize webcam
  const startCamera = async () => {
    setIsLoading(true);
    setCameraError(null);

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Webcam not supported in this environment');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        onVideoElementReady(videoRef.current, mediaStream);
      }
      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access denied';
      console.warn('Webcam initialization failed:', msg);
      setCameraError('Camera offline or blocked');
      setIsLoading(false);
      onVideoElementReady(null, null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onVideoElementReady(null, null);
    };
  }, []);

  // Frame diff motion loop for ΔMotion metric
  useEffect(() => {
    let animId: number;
    const calcCanvas = document.createElement('canvas');
    calcCanvas.width = 32;
    calcCanvas.height = 24;
    const ctx = calcCanvas.getContext('2d', { willReadFrequently: true });
    let lastTime = 0;

    const tick = (now: number) => {
      if (now - lastTime > 120) {
        lastTime = now;
        if (videoRef.current && videoRef.current.readyState >= 2 && ctx) {
          try {
            ctx.drawImage(videoRef.current, 0, 0, 32, 24);
            const currentData = ctx.getImageData(0, 0, 32, 24).data;
            if (prevFrameRef.current) {
              let diff = 0;
              for (let i = 0; i < currentData.length; i += 4) {
                diff += Math.abs(currentData[i] - prevFrameRef.current[i]);
              }
              const avg = diff / (currentData.length / 4);
              const val = Math.min(0.99, avg / 40);
              setMotionDelta(val.toFixed(2));
            }
            prevFrameRef.current = new Uint8ClampedArray(currentData);
          } catch {
            // silent catch
          }
        } else {
          // Simulation when camera is off
          const sim = userStatus === 'ACTIVE' ? 0.35 + Math.random() * 0.15 : 0.01 + Math.random() * 0.02;
          setMotionDelta(sim.toFixed(2));
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [userStatus]);

  // Draw MediaPipe Landmark Mesh overlay on canvas
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !showMeshOverlay) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (landmarks && isFaceDetected) {
      const w = canvas.width;
      const h = canvas.height;

      // Draw subtle face mesh wireframe dots
      ctx.fillStyle = 'rgba(52, 211, 153, 0.45)';
      // Sample subset of face landmarks
      for (let i = 0; i < landmarks.length; i += 7) {
        const pt = landmarks[i];
        if (pt) {
          const x = (1 - pt.x) * w; // mirrored
          const y = pt.y * h;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Highlight Landmark Index 1 (Nose Tip)
      if (noseTip) {
        const nx = (1 - noseTip.x) * w;
        const ny = noseTip.y * h;

        // Target reticle
        ctx.strokeStyle = userStatus === 'STATIC' ? '#06b6d4' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Label: "NOSE #1"
        ctx.font = '7px monospace';
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText('NOSE #1', nx + 8, ny + 3);
      }
    }
  }, [landmarks, noseTip, userStatus, showMeshOverlay, isFaceDetected]);

  return (
    <aside
      aria-label="Procrastination Telemetry HUD"
      className={`fixed bottom-5 right-5 z-40 transition-all duration-300 font-sans select-none ${
        isMinimized ? 'w-auto' : 'w-[180px]'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-xl border bg-slate-900/90 backdrop-blur-md shadow-2xl transition-all ${
          isPanicMode
            ? 'border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/40'
            : 'border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.7)]'
        }`}
      >
        {/* HUD Top Bar */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800/80 bg-slate-950/70 text-[10px]">
          <div className="flex items-center gap-1.5 font-mono text-slate-400">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                stream
                  ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold tracking-wider text-[9px] uppercase">
              {stream ? 'HUD: LIVE' : 'HUD: SIM'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setShowMeshOverlay((prev) => !prev);
                playBlip(720);
              }}
              title={showMeshOverlay ? 'Hide mesh points' : 'Show mesh points'}
              className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
            >
              {showMeshOverlay ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button
              onClick={() => {
                setIsMinimized((prev) => !prev);
                playBlip(540);
              }}
              title={isMinimized ? 'Expand HUD' : 'Minimize HUD'}
              className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Minimized strip representation */}
        {isMinimized ? (
          <div className="p-2 flex items-center justify-between gap-3 bg-slate-900/95">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono font-medium text-emerald-400">
                ΔMotion: {motionDelta}
              </span>
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="text-[9px] text-slate-400 hover:text-white underline"
            >
              Expand
            </button>
          </div>
        ) : (
          <>
            {/* Webcam / Preview Viewport */}
            <div className="relative w-full aspect-[4/3] bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* Actual Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => {
                  videoRef.current?.play().catch(() => {});
                  if (videoRef.current && stream) {
                    onVideoElementReady(videoRef.current, stream);
                  }
                }}
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                  stream ? 'opacity-90 contrast-110 brightness-95' : 'hidden'
                }`}
              />

              {/* Landmark Mesh Overlay Canvas */}
              <canvas
                ref={overlayCanvasRef}
                width={180}
                height={135}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
              />

              {/* Fallback if no camera */}
              {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-gradient-to-b from-slate-900 to-slate-950">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span className="text-[9px] text-slate-400 font-mono">Connecting camera...</span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <div className="w-9 h-9 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center mb-1">
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-300 font-medium">Virtual Mesh Feed</span>
                      <button
                        onClick={startCamera}
                        className="mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono flex items-center gap-1"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Retry
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* REQUIRED OVERLAY 1: Glowing Green Pill "LOCAL MESH • ZERO DATA SENT" */}
              <div className="absolute top-2 inset-x-0 flex justify-center pointer-events-none px-1 z-20">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/85 backdrop-blur-md border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.4)] text-[8.5px] font-mono font-semibold tracking-wider text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                  <span>LOCAL MESH • ZERO DATA SENT</span>
                </div>
              </div>

              {/* REQUIRED OVERLAY 2: Live status metric "ΔMotion: 0.00" */}
              <div className="absolute bottom-2 left-2 pointer-events-none z-20">
                <div
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950/85 backdrop-blur-sm border font-mono text-[9px] font-bold shadow-md transition-colors ${
                    parseFloat(motionDelta) > 0.4
                      ? 'text-amber-400 border-amber-500/40'
                      : 'text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  <Activity className="w-2.5 h-2.5 animate-pulse" />
                  <span>ΔMotion: {motionDelta}</span>
                </div>
              </div>

              {/* Live Status indicator in bottom right */}
              <div className="absolute bottom-2 right-2 pointer-events-none z-20">
                <div
                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                    userStatus === 'STATIC'
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {userStatus}
                </div>
              </div>
            </div>

            {/* Micro Telemetry Footer */}
            <div className="px-2.5 py-1.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-300">Airgapped</span>
              </span>
              <span className="text-[8px] text-slate-400">
                ΔPos: {deltaPos.toFixed(3)}
              </span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
