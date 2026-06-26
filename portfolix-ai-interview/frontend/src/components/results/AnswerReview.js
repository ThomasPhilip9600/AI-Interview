import React from 'react';
import { 
  Play, 
  MessageSquare, 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Video 
} from 'lucide-react';

export default function AnswerReview({ answer, index }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef(null);

  const evaluation = answer.evaluation_data || {};
  const feedback = evaluation.ai_feedback || { strengths: [], weaknesses: [], keywords_missing: [] };
  const refinedAnswer = evaluation.refined_answer || '';
  const posture = evaluation.detailed_posture_metrics || {};

  // Formulate absolute media URL mapping
  const getVideoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Serve from proxy/uploads route
    return url;
  };

  return (
    <div className="answer-review-card glass-card">
      <div className="answer-review-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="q-number-circle small-circle">{index + 1}</div>
          <h3 className="review-question-text">{answer.question_text}</h3>
        </div>
        <span className={`badge-difficulty difficulty-${answer.difficulty.toLowerCase()}`}>
          {answer.difficulty}
        </span>
      </div>

      <div className="answer-review-body flex-row-split">
        {/* Left Side: Video Playback & Core Scores */}
        <div className="review-media-panel">
          <div className="video-container glass-card mb-4">
            <video 
              ref={videoRef}
              src={getVideoUrl(answer.video_url)}
              controls
              className="webcam-preview"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {!isPlaying && (
              <div className="video-play-overlay" onClick={() => videoRef.current?.play()}>
                <div className="play-button-icon">
                  <Play size={24} fill="currentColor" className="text-white ml-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Core sub-scores */}
          <div className="sub-scores-grid">
            <div className="sub-score-item glass-card">
              <span className="sub-score-lbl">Answer Score</span>
              <div className="sub-score-val text-violet-400">{answer.answer_score}/100</div>
            </div>

            <div className="sub-score-item glass-card">
              <span className="sub-score-lbl">Speech Score</span>
              <div className="sub-score-val text-emerald-400">{answer.speech_score}/10</div>
            </div>

            <div className="sub-score-item glass-card">
              <span className="sub-score-lbl">Body Language</span>
              <div className="sub-score-val text-amber-400">{answer.body_language_score}/10</div>
            </div>
          </div>
        </div>

        {/* Right Side: Transcript, Strengths/Weaknesses & Refined Ideal Answer */}
        <div className="review-details-panel">
          
          {/* Transcript Box */}
          <div className="details-section shadow-sm">
            <h4 className="details-section-title flex items-center gap-1.5">
              <MessageSquare size={14} className="text-violet-400" />
              Your Transcript
            </h4>
            <p className="details-section-content transcript-text">
              "{answer.transcript || 'No transcript generated.'}"
            </p>
          </div>

          {/* Feedback Section */}
          <div className="details-section feedback-boxes">
            <div className="grid-2-cols">
              <div className="feedback-column strengths-box">
                <h5 className="feedback-header text-emerald-400 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Strengths
                </h5>
                <ul>
                  {feedback.strengths && feedback.strengths.length > 0 ? (
                    feedback.strengths.map((str, idx) => <li key={idx}>{str}</li>)
                  ) : (
                    <li>Articulated thoughts clearly.</li>
                  )}
                </ul>
              </div>

              <div className="feedback-column weaknesses-box">
                <h5 className="feedback-header text-rose-400 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Improvement Areas
                </h5>
                <ul>
                  {feedback.weaknesses && feedback.weaknesses.length > 0 ? (
                    feedback.weaknesses.map((weak, idx) => <li key={idx}>{weak}</li>)
                  ) : (
                    <li>Explain technical definitions in greater detail.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Missing Keywords */}
            {feedback.keywords_missing && feedback.keywords_missing.length > 0 && (
              <div className="missing-keywords-section mt-2">
                <h5 className="feedback-header text-violet-400">Missing Key Terms</h5>
                <div className="keyword-pills">
                  {feedback.keywords_missing.map((kw, idx) => (
                    <span key={idx} className="keyword-pill-missing">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Posture Scores Details */}
          <div className="details-section posture-metrics-summary">
            <h4 className="details-section-title flex items-center gap-1.5">
              <TrendingUp size={14} className="text-violet-400" />
              Vocal & Posture Metrics
            </h4>
            <div className="metrics-pills-row">
              <div className="metric-pill">
                <span>Eye Contact:</span>
                <strong>{posture.eyeContactPercent || 90}%</strong>
              </div>
              <div className="metric-pill">
                <span>Centering:</span>
                <strong>{posture.faceCenteredPercent || 95}%</strong>
              </div>
              <div className="metric-pill">
                <span>Lighting Check:</span>
                <strong>{posture.lightingOkPercent || 100}%</strong>
              </div>
            </div>
          </div>

          {/* AI Refined Answer */}
          {refinedAnswer && (
            <div className="details-section refined-answer-box glass-card border-violet-900/40">
              <h4 className="details-section-title flex items-center gap-1.5 text-violet-300">
                <Sparkles size={14} className="text-violet-400" />
                AI Refined Response
              </h4>
              <p className="details-section-content refined-text">
                {refinedAnswer}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
