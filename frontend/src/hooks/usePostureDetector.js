import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export default function usePostureDetector(videoRef) {
  const [detectorState, setDetectorState] = useState({
    ready: false,
    faceCount: 0,
    isCentered: false,
    isProperDistance: false,
    errorMessage: '',
    isValid: false
  });
  
  const faceLandmarkerRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const lookAwayCountRef = useRef(0);

  // Metrics accumulators for behavioral analytics
  const metricsRef = useRef({
    totalFrames: 0,
    eyeContactFrames: 0,
    faceCenteredFrames: 0,
    headPitchValues: [],
    headYawValues: [],
    headRollValues: [],
    shoulderAlignmentValues: [],
    warnings: new Set()
  });

  // Initialize the model
  useEffect(() => {
    let isMounted = true;
    
    async function initModel() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        
        const facePromise = FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: 2
        });

        const posePromise = PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });

        const [faceLandmarker, poseLandmarker] = await Promise.all([facePromise, posePromise]);
        
        if (isMounted) {
          faceLandmarkerRef.current = faceLandmarker;
          poseLandmarkerRef.current = poseLandmarker;
          setDetectorState(prev => ({ ...prev, ready: true }));
        }
      } catch (err) {
        console.error("Error loading MediaPipe model:", err);
        if (isMounted) {
          setDetectorState(prev => ({ ...prev, errorMessage: "Failed to load AI models" }));
        }
      }
    }
    
    initModel();
    
    return () => {
      isMounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (faceLandmarkerRef.current) faceLandmarkerRef.current.close();
      if (poseLandmarkerRef.current) poseLandmarkerRef.current.close();
    };
  }, []);

  // Get aggregated metrics when the recording stops
  const getAggregatedMetrics = useCallback(() => {
    const m = metricsRef.current;
    if (m.totalFrames === 0) {
      return {
        eyeContactPercentage: 0,
        faceCenteredPercentage: 0,
        headStability: 0,
        shoulderAlignment: 0
      };
    }
    
    const eyeContactPercentage = Math.round((m.eyeContactFrames / m.totalFrames) * 100);
    const faceCenteredPercentage = Math.round((m.faceCenteredFrames / m.totalFrames) * 100);
    
    const calculateVariance = (arr) => {
      if (arr.length === 0) return 0;
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    };
    
    const pitchVar = calculateVariance(m.headPitchValues);
    const yawVar = calculateVariance(m.headYawValues);
    const rollVar = calculateVariance(m.headRollValues);
    
    const totalVar = pitchVar + yawVar + rollVar;
    let headStability = 10 - Math.min(totalVar * 10, 10);
    if (headStability < 0) headStability = 0;
    
    const avgShoulderDy = m.shoulderAlignmentValues.length > 0 
      ? m.shoulderAlignmentValues.reduce((a,b)=>a+Math.abs(b),0)/m.shoulderAlignmentValues.length 
      : 0;
      
    let shoulderAlignment = 10 - Math.min(avgShoulderDy * 50, 10);
    if (shoulderAlignment < 0) shoulderAlignment = 0;
    
    return {
      eyeContactPercentage,
      faceCenteredPercentage,
      headStability: Math.round(headStability * 10) / 10,
      shoulderAlignment: Math.round(shoulderAlignment * 10) / 10,
      warnings: Array.from(m.warnings)
    };
  }, []);

  // Analysis Loop
  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !faceLandmarkerRef.current || !poseLandmarkerRef.current) {
      requestRef.current = requestAnimationFrame(analyzeFrame);
      return;
    }

    const video = videoRef.current;
    
    if (video.readyState >= 2 && video.videoWidth > 0 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      
      const now = performance.now();
      const faceResults = faceLandmarkerRef.current.detectForVideo(video, now);
      const poseResults = poseLandmarkerRef.current.detectForVideo(video, now);
      
      const faceCount = faceResults.faceLandmarks ? faceResults.faceLandmarks.length : 0;
      let isCentered = false;
      let isProperDistance = false;
      let errorMessage = '';
      
      if (faceCount === 0) {
        errorMessage = 'No face detected. Please look at the camera.';
      } else if (faceCount > 1) {
        errorMessage = 'Multiple people detected. Only you should be in the frame.';
      } else {
        metricsRef.current.totalFrames++;
        
        // --- 1. FACE CENTERING & DISTANCE ---
        const landmarks = faceResults.faceLandmarks[0];
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        landmarks.forEach(point => {
          if (point.x < minX) minX = point.x;
          if (point.x > maxX) maxX = point.x;
          if (point.y < minY) minY = point.y;
          if (point.y > maxY) maxY = point.y;
        });
        
        const faceWidth = maxX - minX;
        const faceHeight = maxY - minY;
        const centerX = minX + (faceWidth / 2);
        const centerY = minY + (faceHeight / 2);

        if (centerX > 0.35 && centerX < 0.65 && centerY > 0.2 && centerY < 0.8) {
          isCentered = true;
          metricsRef.current.faceCenteredFrames++;
        } else {
          errorMessage = 'Please center your face in the camera.';
        }

        if (faceWidth > 0.15 && faceWidth < 0.45) {
          isProperDistance = true;
        } else {
          if (faceWidth <= 0.15) {
            errorMessage = 'You are too far away. Please move closer.';
          } else {
            errorMessage = 'You are too close. Please move back so your shoulders are visible.';
          }
        }

        // --- 2. EYE GAZE TRACKING ---
        let isLookingAtScreen = true;
        if (faceResults.faceBlendshapes && faceResults.faceBlendshapes.length > 0) {
          const shapes = faceResults.faceBlendshapes[0].categories;
          const eyeLookOutLeft = shapes.find(s => s.categoryName === 'eyeLookOutLeft')?.score || 0;
          const eyeLookInRight = shapes.find(s => s.categoryName === 'eyeLookInRight')?.score || 0;
          const eyeLookOutRight = shapes.find(s => s.categoryName === 'eyeLookOutRight')?.score || 0;
          const eyeLookInLeft = shapes.find(s => s.categoryName === 'eyeLookInLeft')?.score || 0;
          const eyeLookUpLeft = shapes.find(s => s.categoryName === 'eyeLookUpLeft')?.score || 0;
          const eyeLookDownLeft = shapes.find(s => s.categoryName === 'eyeLookDownLeft')?.score || 0;
          
          const eyeBlinkLeft = shapes.find(s => s.categoryName === 'eyeBlinkLeft')?.score || 0;
          const eyeBlinkRight = shapes.find(s => s.categoryName === 'eyeBlinkRight')?.score || 0;

          // If the user is blinking, override and assume they are looking at the screen.
          // This avoids false warnings during normal blinks.
          if (eyeBlinkLeft > 0.4 || eyeBlinkRight > 0.4) {
            isLookingAtScreen = true;
          } else {
            // Relaxed thresholds (0.55 for horizontal and 0.65 for vertical/diagonal movements)
            // to allow normal eyes scanning across the screen layout.
            if (eyeLookOutLeft > 0.55 || eyeLookInRight > 0.55 || eyeLookOutRight > 0.55 || eyeLookInLeft > 0.55 || eyeLookUpLeft > 0.65 || eyeLookDownLeft > 0.65) {
               isLookingAtScreen = false;
            }
          }
        }

        // Apply temporal dampening/smoothing to avoid false positives (e.g. blinks or quick reading glance)
        if (!isLookingAtScreen) {
          lookAwayCountRef.current++;
        } else {
          lookAwayCountRef.current = 0;
          metricsRef.current.eyeContactFrames++;
        }

        // Only count as look-away and show warning if consecutive frames exceed ~30 (about 1 second of looking away)
        const hasLookedAwayTooLong = lookAwayCountRef.current > 30;

        if (isCentered && isProperDistance && hasLookedAwayTooLong && !errorMessage) {
          errorMessage = 'Please maintain eye contact with the screen.';
        }

        // --- 3. HEAD POSE ---
        if (faceResults.facialTransformationMatrixes && faceResults.facialTransformationMatrixes.length > 0) {
          const matrix = faceResults.facialTransformationMatrixes[0].data;
          const pitch = Math.atan2(matrix[6], matrix[10]);
          const yaw = Math.atan2(-matrix[2], Math.sqrt(matrix[6]*matrix[6] + matrix[10]*matrix[10]));
          const roll = Math.atan2(matrix[1], matrix[0]);
          
          metricsRef.current.headPitchValues.push(pitch);
          metricsRef.current.headYawValues.push(yaw);
          metricsRef.current.headRollValues.push(roll);

          if (isCentered && isProperDistance && !errorMessage) {
            if (Math.abs(yaw) > 0.6) {
              errorMessage = 'Please keep your head facing forward.';
            } else if (Math.abs(pitch) > 0.6) {
              errorMessage = 'Please keep your head straight.';
            }
          }
        }

        // --- 4. POSTURE / SHOULDERS ---
        if (poseResults.landmarks && poseResults.landmarks.length > 0) {
          const pose = poseResults.landmarks[0];
          const leftShoulder = pose[11];
          const rightShoulder = pose[12];
          
          if (leftShoulder && rightShoulder) {
             const dy = leftShoulder.y - rightShoulder.y;
             metricsRef.current.shoulderAlignmentValues.push(dy);

             if (isCentered && isProperDistance && Math.abs(dy) > 0.15 && !errorMessage) {
               errorMessage = 'Your shoulders are unaligned. Please sit up straight.';
             }
          }
        }
      }

      setDetectorState(prev => {
        if (errorMessage) {
          metricsRef.current.warnings.add(errorMessage);
        }
        const isValid = faceCount === 1 && isCentered && isProperDistance && !errorMessage;
        if (
          prev.faceCount !== faceCount ||
          prev.isCentered !== isCentered ||
          prev.isProperDistance !== isProperDistance ||
          prev.errorMessage !== errorMessage ||
          prev.isValid !== isValid
        ) {
          return { ...prev, faceCount, isCentered, isProperDistance, errorMessage, isValid };
        }
        return prev;
      });
    }

    requestRef.current = requestAnimationFrame(analyzeFrame);
  }, [videoRef]);

  useEffect(() => {
    if (detectorState.ready) {
      requestRef.current = requestAnimationFrame(analyzeFrame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [detectorState.ready, analyzeFrame]);

  return { ...detectorState, getAggregatedMetrics };
}
