import React from 'react';
import { mediaService } from '../../services/mediaService';
import { Camera, Mic, Play, RefreshCw, AlertTriangle } from 'lucide-react';

export default function SetupHardware({ onPermissionGranted, onCancel }) {
  const [stream, setStream] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const videoRef = React.useRef(null);
  const audioContextRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const [micVolume, setMicVolume] = React.useState(0);
  const volumeIntervalRef = React.useRef(null);

  const requestPermissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mediaStream = await mediaService.requestPermissions();
      setStream(mediaStream);
      
      // Bind video preview
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Initialize audio indicator
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(mediaStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        volumeIntervalRef.current = setInterval(() => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            // Map avg (0-255) to a scale (0-100)
            setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
          }
        }, 100);
      } catch (err) {
        console.warn('Could not initialize audio volume analyser:', err);
      }

    } catch (err) {
      console.error('Error requesting media permissions:', err);
      setError(err.message || 'Camera or Microphone access was denied. Please allow permissions in your browser URL bar.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    requestPermissions();

    return () => {
      // Clean up stream and timers
      if (stream) {
        mediaService.stopStream(stream);
      }
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleNext = () => {
    if (stream) {
      onPermissionGranted(stream);
    }
  };

  return (
    <div className="setup-container">
      <div className="glass-card setup-card flex-row-split">
        {/* Left Side: Setup Controls */}
        <div className="setup-info-panel">
          <h2 className="setup-title">Hardware Permissions Check</h2>
          <p className="setup-subtitle">
            Allow camera and microphone access to record your answers.
          </p>

          <div className="status-indicators">
            {/* Camera Status */}
            <div className={`status-item ${stream ? 'success' : 'pending'}`}>
              <div className="icon-badge">
                <Camera size={18} />
              </div>
              <div className="status-body">
                <h4>Webcam Connection</h4>
                <p>{stream ? 'Active & Running' : 'Waiting for access...'}</p>
              </div>
            </div>

            {/* Microphone Status */}
            <div className={`status-item ${stream ? 'success' : 'pending'}`}>
              <div className="icon-badge">
                <Mic size={18} />
              </div>
              <div className="status-body">
                <h4>Microphone Level</h4>
                {stream ? (
                  <div className="volume-meter-wrapper">
                    <div className="volume-meter-bar" style={{ width: `${micVolume}%` }}></div>
                  </div>
                ) : (
                  <p>Waiting for audio input...</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="alert-box error-alert flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="setup-actions">
            {!stream ? (
              <button 
                className="btn btn-secondary btn-icon" 
                onClick={requestPermissions}
                disabled={isLoading}
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                Try Again
              </button>
            ) : (
              <button className="btn btn-primary btn-icon" onClick={handleNext}>
                Proceed to Posture Check
                <Play size={14} />
              </button>
            )}
            <button className="btn btn-text" onClick={onCancel}>Cancel</button>
          </div>
        </div>

        {/* Right Side: Live Video Preview */}
        <div className="setup-video-panel">
          <div className="video-container glass-card">
            {stream ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="webcam-preview mirror-x"
              />
            ) : (
              <div className="video-placeholder">
                <Camera size={40} className="text-slate-600 animate-pulse" />
                <p>Webcam preview will appear here</p>
              </div>
            )}
            {stream && <div className="live-badge">LIVE PREVIEW</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
