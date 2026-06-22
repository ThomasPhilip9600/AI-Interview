import React from 'react';
import { Play, Clock, HelpCircle } from 'lucide-react';

export default function QuestionDisplay({ 
  question, 
  currentIndex, 
  totalQuestions, 
  onStartRecording 
}) {
  const [prepTimeLeft, setPrepTimeLeft] = React.useState(question.preparation_time || 15);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    // Reset timer when question changes
    setPrepTimeLeft(question.preparation_time || 15);
    
    // Clear any previous interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setPrepTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onStartRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [question, onStartRecording]);

  const progressPercent = Math.round((prepTimeLeft / (question.preparation_time || 15)) * 100);

  return (
    <div className="prep-container">
      <div className="glass-card prep-card">
        <div className="prep-header">
          <span className="badge badge-accent">PREPARATION PHASE</span>
          <span className="q-counter">Question {currentIndex + 1} of {totalQuestions}</span>
        </div>

        <div className="prep-body">
          <span className={`badge-difficulty difficulty-${question.difficulty.toLowerCase()} mb-2`}>
            {question.difficulty} Level
          </span>
          <h1 className="prep-question-text">{question.question_text}</h1>
        </div>

        <div className="prep-timer-panel flex items-center gap-6">
          <div className="timer-radial">
            <svg viewBox="0 0 36 36" className="circular-chart timer-chart">
              <path className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle timer-circle"
                strokeDasharray={`${progressPercent}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage timer-text">{prepTimeLeft}s</text>
            </svg>
          </div>
          <div className="timer-details">
            <h3>Prepare your response</h3>
            <p>
              Use this time to structure your thoughts. Recording will start automatically, or you can begin manually.
            </p>
          </div>
        </div>

        <div className="prep-actions flex items-center justify-between">
          <span className="q-time-limit flex items-center gap-1">
            <Clock size={14} className="text-slate-400" />
            Maximum record duration: {question.allowed_time} seconds
          </span>
          <button 
            className="btn btn-primary btn-icon start-rec-btn" 
            onClick={onStartRecording}
          >
            <Play size={14} />
            Start Recording Now
          </button>
        </div>
      </div>
    </div>
  );
}
