import { useState, useEffect, useRef } from 'react';

export default function useMediaRecorder() {
  const [mediaStream, setMediaStream] = useState(null);
  const streamRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [error, setError] = useState('');
  const chunksRef = useRef([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!isMountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setMediaStream(stream);
      streamRef.current = stream;
      setError('');
      return stream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
      setError('Camera or microphone permission denied.');
      return null;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaStream) {
      setMediaStream(null);
    }
  };

  const startRecording = (streamToRecord = mediaStream) => {
    if (!streamToRecord) return;
    
    // Attempt to use WebM, fallback if needed
    const options = { mimeType: 'video/webm; codecs=vp9,opus' };
    let recorder;
    try {
      recorder = new MediaRecorder(streamToRecord, options);
    } catch (e) {
      // Fallback
      recorder = new MediaRecorder(streamToRecord);
    }

    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
      setRecordedBlob(blob);
    };

    // --- Audio volume detection ---
    setHasSpoken(false);
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(streamToRecord);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let isChecking = true;
      const checkVolume = () => {
        if (!isChecking) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        let avg = sum / bufferLength;
        
        if (avg > 10) { // Threshold for speech detection
          setHasSpoken(true);
          isChecking = false; // Stop checking once we heard speech
        } else {
          requestAnimationFrame(checkVolume);
        }
      };
      
      requestAnimationFrame(checkVolume);

      // Clean up analyser when stopped
      recorder.addEventListener('stop', () => {
        isChecking = false;
        audioCtx.close().catch(console.error);
      });
    } catch (err) {
      console.warn("Could not start audio analyser", err);
    }

    recorder.start(1000); // chunk every 1s
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return {
    mediaStream,
    isRecording,
    recordedBlob,
    hasSpoken,
    error,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    setRecordedBlob
  };
}
