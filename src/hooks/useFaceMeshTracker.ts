import { useEffect, useRef, useState, useCallback } from 'react';

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export interface FaceTrackerState {
  noseTip: LandmarkPoint | null;
  deltaPos: number;
  isStatic: boolean;
  userStatus: 'STATIC' | 'ACTIVE';
  isLookingAtScreen: boolean;
  gazeDirection: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
  landmarks: LandmarkPoint[] | null;
  isFaceDetected: boolean;
  lastFaceSeenTime: number;
  isModelReady: boolean;
  modelError: string | null;
  inferenceCount: number;
  isSuddenDropDetected: boolean;
}

export function useFaceMeshTracker(
  videoElement: HTMLVideoElement | null,
  streamActive: boolean
) {
  const [state, setState] = useState<FaceTrackerState>({
    noseTip: null,
    deltaPos: 0.0,
    isStatic: true,
    userStatus: 'STATIC',
    isLookingAtScreen: true,
    gazeDirection: 'CENTER',
    landmarks: null,
    isFaceDetected: true,
    lastFaceSeenTime: Date.now(),
    isModelReady: false,
    modelError: null,
    inferenceCount: 0,
    isSuddenDropDetected: false,
  });

  const prevNoseRef = useRef<LandmarkPoint | null>(null);
  const noseHistoryRef = useRef<{ y: number; time: number }[]>([]);
  const landmarkerRef = useRef<any>(null);
  const lastInferenceTimeRef = useRef<number>(0);
  const isInitializingRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      if (isInitializingRef.current || landmarkerRef.current) return;
      isInitializingRef.current = true;

      try {
        const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision');
        
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );

        if (isCancelled) return;

        // Use CPU delegate directly to avoid GPU fallback warnings
        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });

        if (isCancelled) {
          faceLandmarker.close();
          return;
        }

        landmarkerRef.current = faceLandmarker;
        setState((prev) => ({ ...prev, isModelReady: true, modelError: null }));
      } catch (err: any) {
        // Resilient fallback estimator
        setState((prev) => ({
          ...prev,
          isModelReady: true,
          modelError: 'Using resilient fallback estimator',
        }));
      } finally {
        isInitializingRef.current = false;
      }
    }

    initMediaPipe();

    return () => {
      isCancelled = true;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {
          // cleanup
        }
        landmarkerRef.current = null;
      }
    };
  }, []);

  // Main inference loop throttled to >= 200ms
  useEffect(() => {
    let isActive = true;

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 64;
    offscreenCanvas.height = 48;
    const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    const processFrame = () => {
      if (!isActive) return;

      const now = performance.now();

      // STRICT THROTTLE: Run inference every >= 200ms to save CPU
      if (now - lastInferenceTimeRef.current >= 200) {
        lastInferenceTimeRef.current = now;

        if (videoElement && streamActive && videoElement.readyState >= 2) {
          if (landmarkerRef.current) {
            try {
              const results = landmarkerRef.current.detectForVideo(videoElement, now);

              if (results?.faceLandmarks && results.faceLandmarks.length > 0) {
                const face = results.faceLandmarks[0];
                // Landmark index 1 is canonical Nose Tip
                const nose: LandmarkPoint = face[1] || { x: 0.5, y: 0.5 };

                // Calculate Euclidean distance between consecutive nose coordinates (ΔPos)
                let deltaPos = 0.0;
                if (prevNoseRef.current) {
                  const dx = nose.x - prevNoseRef.current.x;
                  const dy = nose.y - prevNoseRef.current.y;
                  deltaPos = Math.sqrt(dx * dx + dy * dy);
                }
                prevNoseRef.current = nose;

                // --- SUDDEN DROP DETECTION (within 1-2 seconds) ---
                const history = noseHistoryRef.current;
                history.push({ y: nose.y, time: now });
                // Keep only last 2.2 seconds
                while (history.length > 0 && now - history[0].time > 2200) {
                  history.shift();
                }

                let suddenDrop = false;
                if (history.length >= 2) {
                  const oldest = history[0];
                  const dropDeltaY = nose.y - oldest.y;
                  // If nose dropped downwards significantly (delta Y > 0.32) in under 2s or nose plunged to bottom
                  if (dropDeltaY > 0.32 || (dropDeltaY > 0.22 && nose.y > 0.78)) {
                    suddenDrop = true;
                  }
                }

                // Immobility condition: If ΔPos < 0.015, mark user status as "STATIC", otherwise "ACTIVE"
                const isStatic = deltaPos < 0.015;
                const userStatus = isStatic ? 'STATIC' : 'ACTIVE';

                // Eye landmarks for gaze direction
                const leftEyeInner = face[133] || face[33];
                const rightEyeInner = face[362] || face[263];
                const eyeMidX = leftEyeInner && rightEyeInner ? (leftEyeInner.x + rightEyeInner.x) / 2 : 0.5;
                const eyeMidY = leftEyeInner && rightEyeInner ? (leftEyeInner.y + rightEyeInner.y) / 2 : 0.45;

                const offsetX = nose.x - eyeMidX;
                const offsetY = nose.y - eyeMidY;

                const isLookingAtScreen = Math.abs(offsetX) < 0.08 && offsetY > 0.02 && offsetY < 0.16;

                let gazeDirection: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' = 'CENTER';
                if (offsetX > 0.06) gazeDirection = 'RIGHT';
                else if (offsetX < -0.06) gazeDirection = 'LEFT';
                else if (offsetY < 0.03) gazeDirection = 'UP';
                else if (offsetY > 0.14) gazeDirection = 'DOWN';

                setState((prev) => ({
                  ...prev,
                  noseTip: nose,
                  deltaPos,
                  isStatic,
                  userStatus,
                  isLookingAtScreen,
                  gazeDirection,
                  landmarks: face,
                  isFaceDetected: true,
                  lastFaceSeenTime: Date.now(),
                  inferenceCount: prev.inferenceCount + 1,
                  isSuddenDropDetected: suddenDrop ? true : prev.isSuddenDropDetected,
                }));
              } else {
                // If face suddenly vanished immediately after moving downwards rapidly
                const history = noseHistoryRef.current;
                let suddenDrop = false;
                if (history.length >= 2) {
                  const oldest = history[0];
                  const newest = history[history.length - 1];
                  if (newest.y - oldest.y > 0.25 || newest.y > 0.7) {
                    suddenDrop = true;
                  }
                }

                setState((prev) => ({
                  ...prev,
                  isFaceDetected: false,
                  isLookingAtScreen: false,
                  landmarks: null,
                  userStatus: 'STATIC',
                  isSuddenDropDetected: suddenDrop ? true : prev.isSuddenDropDetected,
                }));
              }
            } catch {
              // Frame dropped safely
            }
          } else {
            // Fallback estimator
            if (ctx) {
              try {
                ctx.drawImage(videoElement, 0, 0, 64, 48);
                const imgData = ctx.getImageData(0, 0, 64, 48).data;
                let totalMass = 0;
                let sumX = 0;
                let sumY = 0;
                for (let y = 0; y < 48; y += 2) {
                  for (let x = 0; x < 64; x += 2) {
                    const idx = (y * 64 + x) * 4;
                    const brightness = (imgData[idx] + imgData[idx + 1] + imgData[idx + 2]) / 3;
                    const weight = 255 - brightness;
                    totalMass += weight;
                    sumX += x * weight;
                    sumY += y * weight;
                  }
                }
                const hasSubstantialMass = totalMass > 5000;
                const rawX = totalMass > 0 ? (sumX / totalMass) / 64 : 0.5;
                const rawY = totalMass > 0 ? (sumY / totalMass) / 48 : 0.5;
                const nose: LandmarkPoint = { x: rawX, y: rawY, z: 0 };

                let deltaPos = 0.0;
                if (prevNoseRef.current) {
                  const dx = nose.x - prevNoseRef.current.x;
                  const dy = nose.y - prevNoseRef.current.y;
                  deltaPos = Math.sqrt(dx * dx + dy * dy);
                }
                prevNoseRef.current = nose;

                const isStatic = deltaPos < 0.015;
                const userStatus = isStatic ? 'STATIC' : 'ACTIVE';

                setState((prev) => ({
                  ...prev,
                  noseTip: nose,
                  deltaPos,
                  isStatic,
                  userStatus,
                  isLookingAtScreen: hasSubstantialMass,
                  isFaceDetected: hasSubstantialMass,
                  lastFaceSeenTime: hasSubstantialMass ? Date.now() : prev.lastFaceSeenTime,
                  gazeDirection: 'CENTER',
                  inferenceCount: prev.inferenceCount + 1,
                }));
              } catch {
                // Ignore
              }
            }
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      isActive = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [videoElement, streamActive]);

  const triggerSuddenDrop = useCallback(() => {
    setState((prev) => ({ ...prev, isSuddenDropDetected: true }));
  }, []);

  const clearSuddenDrop = useCallback(() => {
    noseHistoryRef.current = [];
    setState((prev) => ({ ...prev, isSuddenDropDetected: false }));
  }, []);

  return {
    ...state,
    triggerSuddenDrop,
    clearSuddenDrop,
    setSimulatedFaceAway: (away: boolean) => {
      setState((prev) => ({
        ...prev,
        isFaceDetected: !away,
        isLookingAtScreen: !away,
        lastFaceSeenTime: away ? Date.now() - 6000 : Date.now(),
      }));
    },
  };
}
