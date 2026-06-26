import React from 'react';
import { mediaService } from '../../services/mediaService';
import { VisionService } from '../../services/visionService';
import { PostureScorer } from '../../utils/postureScorer';
import { Square, AlertCircle, ShieldAlert } from 'lucide-react';

export default function RecordingScreen({ 
  stream, 
  question, 
  currentIndex, 
  totalQuestions, 
  onRecordingCompleted 
}) {
  const videoRef = React.useRef(null);
  const [timeLeft, setTimeLeft] = React.useState(question.allowed_time || 60);
  const [warnings, setWarnings] = React.useState([]);
  const [minDurationPassed, setMinDurationPassed] = React.useState(false);

  const recorderControlsRef = React.useRef(null);
  const trackerRef = React.useRef(null);
  const postureScorerRef = React.useRef(new PostureScorer());
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    // 1. Bind webcam stream
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }

    // Reset posture scorer for this question
    postureScorerRef.current.reset();

    // 2. Start MediaPipe posture tracking in background
    if (videoRef.current) {
      trackerRef.current = VisionService.startTracking(
        videoRef.current,
        (results) => {
          const status = postureScorerRef.current.scoreFrame(results);
          setWarnings(status.warnings);
        }
      );
    }

    // 3. Start MediaRecorder
    recorderControlsRef.current = mediaService.startRecorder(
      stream,
      (videoBlob) => {
        // Collect aggregated posture score data
        const finalPostureData = postureScorerRef.current.getFinalScore();
        onRecordingCompleted(videoBlob, finalPostureData);
      }
    );

    // 4. Start recording timers
    setTimeLeft(question.allowed_time || 60);
    setMinDurationPassed(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev - 1;
        
        // Enable manual stop after 3 seconds
        if (question.allowed_time - nextTime >= 3) {
          setMinDurationPassed(true);
        }

        if (nextTime <= 0) {
          clearInterval(timerRef.current);
          handleStopRecording();
          return 0;
        }
        return nextTime;
      });
    }, 1000);

    return () => {
      // Clean up tracking and timers
      if (trackerRef.current) {
        trackerRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [question, stream]);

  const handleStopRecording = () => {
    if (recorderControlsRef.current) {
      recorderControlsRef.current.stop();
    }
  };

  const progressPercent = Math.round((timeLeft / (question.allowed_time || 60)) * 100);

  return (
    <div className="recording-container">
      <div className="glass-card recording-card">
        
        {/* Top Header */}
        <div className="recording-header flex items-center justify-between">
          <div className="rec-status-indicator flex items-center gap-2">
            <div className="red-pulse-dot"></div>
            <span className="rec-label">RECORDING ACTIVE</span>
          </div>
          <span className="q-counter">Question {currentIndex + 1} of {totalQuestions}</span>
        </div>

        {/* Video Panel */}
        <div className="recording-body flex-row-split">
          
          {/* Webcam View */}
          <div className="recording-video-panel">
            <div className="video-container glass-card">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="webcam-preview mirror-x"
              />
              
              {/* Overlay warning banners */}
              {warnings.length > 0 && (
                <div className="floating-warning-banner">
                  <ShieldAlert size={14} className="text-rose-400 shrink-0" />
                  <span>{warnings[0]}</span>
                </div>
              )}

              {/* Small live badge */}
              <div className="rec-duration-badge bg-rose-600">
                {timeLeft}s remaining
              </div>
            </div>
          </div>

          {/* Question & Sidebar Guidance */}
          <div className="recording-info-panel">
            <div className="rec-question-box">
              <span className={`badge-difficulty difficulty-${question.difficulty.toLowerCase()} mb-2`}>
                {question.difficulty}
              </span>
              <h3 className="rec-question-text">{question.question_text}</h3>
            </div>

            {/* Real-time Posture Guidelines */}
            <div className="posture-check-live-panel glass-card">
              <h4 className="panel-title flex items-center gap-1.5">
                <AlertCircle size={14} className="text-violet-400" />
                Live Posture Feedback
              </h4>
              <p className="panel-desc">MediaPipe is tracking your posture. Keep warnings clear to maximize score.</p>
              
              <div className="live-guidelines-checklist">
                <div className={`guide-check-item ${warnings.some(w => w.includes('Center')) ? 'warning' : 'ok'}`}>
                  <div className="check-dot"></div>
                  <span>Face Centered</span>
                </div>
                <div className={`guide-check-item ${warnings.some(w => w.includes('shoulders')) ? 'warning' : 'ok'}`}>
                  <div className="check-dot"></div>
                  <span>Shoulders Visible</span>
                </div>
                <div className={`guide-check-item ${warnings.some(w => w.includes('head')) ? 'warning' : 'ok'}`}>
                  <div className="check-dot"></div>
                  <span>Head Alignment</span>
                </div>
                <div className={`guide-check-item ${warnings.some(w => w.includes('closer') || w.includes('back')) ? 'warning' : 'ok'}`}>
                  <div className="check-dot"></div>
                  <span>Screen Distance</span>
                </div>
              </div>
            </div>

            {/* Control Actions */}
            <div className="rec-actions-panel">
              <button 
                className="btn btn-danger btn-icon w-full"
                onClick={handleStopRecording}
                disabled={!minDurationPassed}
              >
                <Square size={16} fill="currentColor" />
                {!minDurationPassed ? 'Starting...' : 'Stop and Submit'}
              </button>
              <p className="rec-minimum-notice">
                {!minDurationPassed && 'Please record for at least 3 seconds before submitting.'}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
