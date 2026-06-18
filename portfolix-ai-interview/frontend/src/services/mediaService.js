export const mediaService = {
  /**
   * Request user camera and microphone permission.
   * @returns {Promise<MediaStream>} The user media stream.
   */
  async requestPermissions() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Your browser does not support webcam recording.');
    }
    
    return navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      },
      audio: true
    });
  },

  /**
   * Helper to stop a media stream.
   * @param {MediaStream} stream 
   */
  stopStream(stream) {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  },

  /**
   * Initializes a MediaRecorder to record from a stream.
   * @param {MediaStream} stream - Source webcam/mic stream.
   * @param {Function} onStopCallback - Callback triggered when recording stops, receiving the final Blob.
   * @returns {Object} Recorder control functions { stop, pause, resume }
   */
  startRecorder(stream, onStopCallback) {
    let chunks = [];
    
    // Choose appropriate mimeType for cross-browser support
    let options = { mimeType: 'video/webm;codecs=vp8,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: '' }; // fallback to default
      }
    }

    const recorder = new MediaRecorder(stream, options);

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: 'video/webm' });
      chunks = [];
      onStopCallback(finalBlob);
    };

    // Start recording, request data chunks every 1 second
    recorder.start(1000);

    return {
      stop: () => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      },
      pause: () => {
        if (recorder.state === 'recording') {
          recorder.pause();
        }
      },
      resume: () => {
        if (recorder.state === 'paused') {
          recorder.resume();
        }
      }
    };
  }
};
