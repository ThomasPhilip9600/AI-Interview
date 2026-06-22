import React from 'react';
import AnswerReview from './AnswerReview';
import { 
  ArrowLeft, 
  Award, 
  BookOpen, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Sparkles,
  Lightbulb
} from 'lucide-react';

export default function FinalReport({ reportData, onBack }) {
  const { attempt, answers, summary } = reportData;

  // Compute category recommendations
  const recommendations = React.useMemo(() => {
    const category = attempt?.category || 'HR';
    const score = summary?.overall_score || 0;

    if (score >= 85) {
      return {
        verdict: 'Excellent Hire Readiness',
        tips: [
          'Continue practicing advanced scenarios to maintain your quick articulation.',
          'Focus on micro-expressions and slowing down slightly to increase gravitas.',
          'Ready for real-world automated screening rounds!'
        ]
      };
    } else if (score >= 70) {
      return {
        verdict: 'Solid Foundation - Requires Polish',
        tips: [
          'Review the missing keywords in each question and incorporate them into your dictionary.',
          'Work on reducing filler words ("um", "like") to sound more authoritative.',
          'Focus on steady posture; keep head straight and eye contact centered.'
        ]
      };
    } else {
      return {
        verdict: 'Needs Technical & Presentation Practice',
        tips: [
          'Elaborate further on concepts. Try to speak for at least 45–60 seconds per prompt.',
          'Strictly verify camera alignment. Avoid moving off-center or looking away during answers.',
          'Study the AI Refined Responses to learn structure, patterns, and relevant placement keywords.'
        ]
      };
    }
  }, [attempt, summary]);

  return (
    <div className="report-container">
      {/* Back Button */}
      <button className="btn btn-secondary btn-icon back-btn" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Header Info */}
      <div className="report-header-card glass-card">
        <div>
          <span className="badge badge-primary">{attempt?.category} Assessment</span>
          <h1 className="report-title">AI Performance Report</h1>
          <p className="report-subtitle">
            Detailed evaluations, posture highlights, and Whisper transcripts for attempt logs.
          </p>
        </div>
        
        {/* Score Ring */}
        <div className="report-score-indicator flex items-center gap-4">
          <div className="score-radial">
            <svg viewBox="0 0 36 36" className="circular-chart score-chart">
              <path className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle score-circle"
                strokeDasharray={`${summary?.overall_score || 0}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage score-text">{summary?.overall_score || 0}%</text>
            </svg>
          </div>
          <div>
            <span className="score-label">OVERALL RATING</span>
            <h3 className="score-verdict text-violet-300">{recommendations.verdict}</h3>
          </div>
        </div>
      </div>

      {/* Score breakdowns */}
      <div className="stats-cards-layout my-6">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper bg-violet-900/40 text-violet-400">
            <Award size={20} />
          </div>
          <div>
            <div className="stat-label">Knowledge & Rubrics</div>
            <div className="stat-value">{summary?.avg_answer_score || 0}%</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper bg-emerald-900/40 text-emerald-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-label">Speech & Eloquence</div>
            <div className="stat-value">{summary?.avg_speech_score || 0}/10</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper bg-amber-900/40 text-amber-400">
            <Users size={20} />
          </div>
          <div>
            <div className="stat-label">Body Language Score</div>
            <div className="stat-value">{summary?.avg_body_language_score || 0}/10</div>
          </div>
        </div>
      </div>

      <div className="details-layout">
        {/* Left Side: Question Reviews */}
        <div className="answers-panel">
          <h3 className="panel-title">Question-wise Breakdown</h3>
          <p className="panel-desc">Replay recordings, review transcripts, and read detailed scores.</p>
          
          <div className="answers-review-list mt-4 flex flex-col gap-6">
            {answers.map((answer, index) => (
              <AnswerReview 
                key={answer.id} 
                answer={answer} 
                index={index} 
              />
            ))}
          </div>
        </div>

        {/* Right Side: Recommendations Panel */}
        <div className="instructions-panel glass-card h-fit">
          <h3 className="panel-title flex items-center gap-1.5">
            <Lightbulb size={18} className="text-violet-400" />
            AI Recommendations
          </h3>
          <p className="panel-desc">Actionable steps to improve your hire-readiness profile:</p>

          <div className="recommendations-tips-list mt-4 flex flex-col gap-3">
            {recommendations.tips.map((tip, idx) => (
              <div key={idx} className="tip-row flex items-start gap-2 text-slate-300">
                <div className="bullet-point bg-violet-600"></div>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
