import React from 'react';
import { VisionService } from '../../services/visionService';
import { PostureScorer } from '../../utils/postureScorer';
import { CheckCircle, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

export default function PostureCheck({ stream, onCalibrationPassed, onBack }) {
  const videoRef = React.useRef(null);
  const [warnings, setWarnings] = React.useState([]);
  const [isCalibrated, setIsCalibrated] = React.useState(false);
  const [calibrationProgress, setCalibrationProgress] = React.useState(0);
  
  const postureScorerRef = React.useRef(new PostureScorer());
  const trackerRef = React.useRef(null);
  const calibrationTimerRef = React.useRef(null);

  React.useEffect(() => {
    // 1. Bind webcam stream
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }

    let consecutiveSuccessTime = 0;
    const updateRateMs = 300;

    // 2. Start MediaPipe/Simulated tracking
    if (videoRef.current) {
      trackerRef.current = VisionService.startTracking(
        videoRef.current,
        (results) => {
          // Score frame
          const scorer = postureScorerRef.current;
          const status = scorer.scoreFrame(results);
          
          setWarnings(status.warnings);

          if (status.warnings.length === 0) {
            consecutiveSuccessTime += updateRateMs;
            const progress = Math.min(100, Math.round((consecutiveSuccessTime / 3000) * 100));
            setCalibrationProgress(progress);
            
            if (consecutiveSuccessTime >= 3000) {
              setIsCalibrated(true);
            }
          } else {
            consecutiveSuccessTime = 0;
            setCalibrationProgress(0);
            setIsCalibrated(false);
          }
        }
      );
    }

    return () => {
      // Clean up tracking
      if (trackerRef.current) {
        trackerRef.current.stop();
      }
    };
  }, [stream]);

  const handleStart = () => {
    // Compile final calibration metrics (should be near perfect if passed)
    const finalPosture = postureScorerRef.current.getFinalScore();
    onCalibrationPassed(finalPosture);
  };

  return (
    <div className="posture-container">
      <div className="glass-card posture-card">
        {/* Left Side: Alignment Feedback */}
        <div className="calibration-controls">
          <h2 className="setup-title">Posture Calibration Check</h2>
          <p className="setup-subtitle">
            Align your camera settings to ensure optimal facial evaluation by the AI.
          </p>

          <div className="calibration-status-panel">
            {!isCalibrated ? (
              <div className="status-progress-card glass-card">
                <div className="progress-radial">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path className="circle"
                      strokeDasharray={`${calibrationProgress}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" className="percentage">{calibrationProgress}%</text>
                  </svg>
                </div>
                <div className="progress-details">
                  <h4>Lock Alignment</h4>
                  <p>Hold your head straight and centered for 3 seconds.</p>
                </div>
              </div>
            ) : (
              <div className="status-success-card glass-card">
                <CheckCircle size={24} className="text-emerald-400 shrink-0" />
                <div>
                  <h4>Calibration Successful</h4>
                  <p>Your lighting, distance, and face positioning are optimized.</p>
                </div>
              </div>
            )}
          </div>

          {/* Warnings List */}
          <div className="warnings-container">
            <h4 className="warnings-header">Real-Time Indicators</h4>
            {warnings.length === 0 ? (
              <div className="success-indicator flex items-center gap-2 text-emerald-400">
                <UserCheck size={18} />
                <span>Good posture alignment locked.</span>
              </div>
            ) : (
              <div className="warnings-list">
                {warnings.map((w, idx) => (
                  <div key={idx} className="warning-pill flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-rose-400 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="setup-actions">
            <button 
              className="btn btn-primary btn-icon" 
              onClick={handleStart}
              disabled={!isCalibrated}
            >
              Start Interview Questions
              <ArrowRight size={14} />
            </button>
            <button className="btn btn-text" onClick={onBack}>Back</button>
          </div>
        </div>

        {/* Right Side: Camera stream with Oval Overlay */}
        <div className="calibration-video-panel">
          <div className="video-container glass-card">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="webcam-preview mirror-x"
            />
            
            {/* Guide Overlay */}
            <div className={`video-overlay-guide ${isCalibrated ? 'success' : 'pending'}`}>
              <div className="guide-oval"></div>
              <div className="guide-shoulder-line"></div>
            </div>
            
            {isCalibrated && <div className="calibrated-badge">CALIBRATED</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
