export class VisionService {
  /**
   * Initializes and binds MediaPipe FaceMesh and Pose to a video element.
   * @param {HTMLVideoElement} videoElement - The active video preview.
   * @param {Function} onResultsCallback - Triggers when frame calculations arrive.
   * @returns {Object} Controls to start/stop the camera frame loop.
   */
  static startTracking(videoElement, onResultsCallback) {
    console.log('VisionService: Initializing MediaPipe tracking...');

    const isMediaPipeLoaded = window.FaceMesh && window.Pose && window.Camera;
    let cameraInstance = null;
    let isTracking = true;

    if (!isMediaPipeLoaded) {
      console.warn('VisionService: MediaPipe CDN scripts not found or failed to load. Launching simulated posture pipeline.');
      
      // Setup a simulated tracking loop at ~10 FPS for debugging and local mock calibration
      const intervalId = setInterval(() => {
        if (!isTracking) return;
        
        // Emulates typical landmarks for face, shoulders, lighting
        onResultsCallback({
          isSimulated: true,
          faceLandmarks: [{ x: 0.5, y: 0.45, z: 0 }], // Centered face
          poseLandmarks: [
            // Left shoulder
            { x: 0.35, y: 0.8, z: 0 },
            // Right shoulder
            { x: 0.65, y: 0.8, z: 0 }
          ],
          imageWidth: videoElement.videoWidth || 640,
          imageHeight: videoElement.videoHeight || 480
        });
      }, 300);

      return {
        stop: () => {
          isTracking = false;
          clearInterval(intervalId);
          console.log('VisionService: Stopped simulated tracking loop.');
        }
      };
    }

    try {
      // 1. Initialize FaceMesh
      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // 2. Initialize Pose
      const pose = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      let latestFace = null;
      let latestPose = null;

      // Event Listeners for results
      faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          latestFace = results.multiFaceLandmarks[0];
          triggerCombinedResults();
        } else {
          latestFace = null;
          triggerCombinedResults();
        }
      });

      pose.onResults((results) => {
        if (results.poseLandmarks) {
          latestPose = results.poseLandmarks;
          triggerCombinedResults();
        } else {
          latestPose = null;
          triggerCombinedResults();
        }
      });

      function triggerCombinedResults() {
        if (!isTracking) return;
        
        onResultsCallback({
          isSimulated: false,
          faceLandmarks: latestFace,
          poseLandmarks: latestPose,
          imageWidth: videoElement.videoWidth || 640,
          imageHeight: videoElement.videoHeight || 480
        });
      }

      // 3. Setup Camera Loop
      cameraInstance = new window.Camera(videoElement, {
        onFrame: async () => {
          if (!isTracking) return;
          try {
            await faceMesh.send({ image: videoElement });
            await pose.send({ image: videoElement });
          } catch (e) {
            // Suppress frames error if stream is stopping
          }
        },
        width: 640,
        height: 480
      });

      cameraInstance.start();
      console.log('VisionService: MediaPipe Camera tracking started.');

      return {
        stop: () => {
          isTracking = false;
          if (cameraInstance) {
            try {
              cameraInstance.stop();
            } catch (e) {
              // Ignore camera shutdown errors
            }
          }
          console.log('VisionService: MediaPipe Camera tracking stopped.');
        }
      };

    } catch (err) {
      console.error('VisionService: Failed to setup MediaPipe camera tracking:', err);
      // Fall back to simulation if initialization throws errors
      isTracking = true;
      const intervalId = setInterval(() => {
        if (!isTracking) return;
        onResultsCallback({
          isSimulated: true,
          faceLandmarks: [{ x: 0.5, y: 0.45, z: 0 }],
          poseLandmarks: [
            { x: 0.35, y: 0.8, z: 0 },
            { x: 0.65, y: 0.8, z: 0 }
          ],
          imageWidth: 640,
          imageHeight: 480
        });
      }, 300);

      return {
        stop: () => {
          isTracking = false;
          clearInterval(intervalId);
        }
      };
    }
  }
}
