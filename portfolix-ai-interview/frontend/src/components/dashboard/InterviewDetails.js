import React from 'react';
import { 
  ArrowLeft, 
  Play, 
  HelpCircle, 
  Clock, 
  ShieldAlert, 
  Video 
} from 'lucide-react';

export default function InterviewDetails({ category, questions, onBack, onStartInterview }) {
  const filteredQuestions = React.useMemo(() => {
    return questions.filter(q => q.category === category);
  }, [questions, category]);

  return (
    <div className="details-container">
      <button className="btn btn-secondary btn-icon back-btn" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="details-header-card glass-card">
        <div className="header-meta">
          <span className="badge badge-primary">{category} Practice Set</span>
          <h2 className="details-title">{category} Placement Interview</h2>
          <p className="details-subtitle">
            A placement-tailored, one-way mock session simulating automated corporate hiring platforms.
          </p>
        </div>
        
        <button className="btn btn-primary btn-large btn-icon start-btn" onClick={onStartInterview}>
          <Play size={18} />
          Start Session
        </button>
      </div>

      <div className="details-layout">
        {/* Left Side: Questions List */}
        <div className="questions-panel">
          <h3 className="panel-title">Questionnaire ({filteredQuestions.length})</h3>
          <p className="panel-desc">You will answer the following questions sequentially during the mock interview:</p>
          
          <div className="questions-list">
            {filteredQuestions.map((q, idx) => (
              <div key={q.id} className="question-item glass-card">
                <div className="q-number-circle">{idx + 1}</div>
                <div className="q-item-body">
                  <div className="q-item-meta">
                    <span className={`badge-difficulty difficulty-${q.difficulty.toLowerCase()}`}>
                      {q.difficulty}
                    </span>
                    <span className="q-time-tag">
                      <Clock size={12} />
                      Prep: {q.preparation_time}s | Limit: {q.allowed_time}s
                    </span>
                  </div>
                  <p className="q-item-text">{q.question_text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Setup Instructions */}
        <div className="instructions-panel glass-card">
          <h3 className="panel-title">Session Rules & Instructions</h3>
          <div className="instructions-list">
            <div className="instruction-step">
              <div className="step-icon">
                <Video size={18} className="text-violet-400" />
              </div>
              <div className="step-text">
                <h4>1. Hardware Verification</h4>
                <p>Allow camera and microphone access. The browser does not upload content until submission.</p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-icon">
                <ShieldAlert size={18} className="text-violet-400" />
              </div>
              <div className="step-text">
                <h4>2. Real-Time Calibration</h4>
                <p>Complete the posture check to align your head and shoulders. Real-time indicators guide eye alignment.</p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-icon">
                <Clock size={18} className="text-violet-400" />
              </div>
              <div className="step-text">
                <h4>3. Countdown Preparation</h4>
                <p>Receive 15–30 seconds of read-and-prep time before recording begins for each question.</p>
              </div>
            </div>

            <div className="instruction-step">
              <div className="step-icon">
                <HelpCircle size={18} className="text-violet-400" />
              </div>
              <div className="step-text">
                <h4>4. Submit and Review</h4>
                <p>Each answer is evaluated by AI. Read exact transcripts and view recommendations instantly after completion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
