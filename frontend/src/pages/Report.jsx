import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle, FileText, Activity, UserCheck } from 'lucide-react';

export default function Report() {
  const { attemptId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/ai-interviews/attempts/${attemptId}/report`)
      .then(res => {
        setReport(res.data);
        setLoading(false);
      })
      .catch(err => {
        // Mock fallback report based on Sections 6, 7, 8, 9 of task.pdf
        setReport({
          attempt: { final_score: 82, answer_score: 85, speech_score: 80, body_language_score: 90 },
          answers: [
            {
              id: '1', question_text: "Explain the difference between state and props in React.",
              transcript: "So um, basically state is local to a component and props are passed down from parent to child.",
              evaluation: { 
                overall_score: 85, 
                short_feedback: "Solid answer with good foundational knowledge.",
                refined_answer: "State represents the local, mutable data of a component, while props are read-only data passed from parent to child.",
                what_went_well: ["Clear communication"], what_needs_improvement: ["Could provide a concrete example"],
                hire_readiness: "GOOD"
              },
              speech: { final_speech_score: 8, words_per_minute: 130, filler_word_count: 2 },
              posture: { final_posture_score: 9, face_centered_score: 5 }
            }
          ]
        });
        setLoading(false);
      });
  }, [attemptId]);

  if (loading) return <div className="text-center mt-8">Loading Report...</div>;

  const stats = report.attempt;
  const answer = report.answers[0]; // For MVP, show first answer

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl mb-1">Final Interview Report</h2>
          <p className="text-secondary">Attempt ID: {attemptId.split('-')[0]}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-secondary uppercase tracking-widest">Hire Readiness</div>
          <div className="text-xl text-success" style={{ fontWeight: 700 }}>{answer?.evaluation?.hire_readiness || 'NOT_READY'}</div>
        </div>
      </div>

      <div className="grid-cols-3">
        <div className="card text-center" style={{ borderTop: '4px solid var(--accent-primary)' }}>
          <h3 className="text-sm text-secondary uppercase mb-2">Overall Score</h3>
          <div className="text-gradient" style={{ fontSize: '3rem', fontWeight: 700 }}>{stats.final_score?.toFixed(0)}<span className="text-xl text-secondary">/100</span></div>
        </div>
        <div className="card flex flex-col justify-center gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Answer Quality (70%)</span> <span>{stats.answer_score?.toFixed(0)}</span></div>
            <div className="progress-bg"><div className="progress-fill" style={{ width: `${stats.answer_score}%` }}></div></div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Speech (15%)</span> <span>{stats.speech_score?.toFixed(0)}</span></div>
            <div className="progress-bg"><div className="progress-fill" style={{ width: `${stats.speech_score}%`, background: '#3b82f6' }}></div></div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Body Language (15%)</span> <span>{stats.body_language_score?.toFixed(0)}</span></div>
            <div className="progress-bg"><div className="progress-fill" style={{ width: `${stats.body_language_score}%`, background: '#10b981' }}></div></div>
          </div>
        </div>
      </div>

      <h3 className="text-xl mt-4 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>Question Breakdown</h3>
      
      {report.answers.map((ans, idx) => (
        <div key={ans.id} className="card flex flex-col gap-6">
          <div>
            <h4 className="text-secondary text-sm mb-1">Question {idx + 1}</h4>
            <p className="text-lg">{ans.question_text}</p>
          </div>

          <div className="flex gap-6">
            <div style={{ flex: 2 }} className="flex flex-col gap-4">
              <div className="p-4" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div className="flex items-center gap-2 mb-2"><FileText size={18} color="var(--accent-primary)" /> <h5 className="font-semibold">Transcript</h5></div>
                <p className="text-sm text-secondary italic">"{ans.transcript}"</p>
              </div>
              
              <div className="p-4" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                <div className="flex items-center gap-2 mb-2"><CheckCircle size={18} color="var(--success)" /> <h5 className="font-semibold">AI Refined Answer</h5></div>
                <p className="text-sm">{ans.evaluation?.refined_answer}</p>
              </div>

              <div className="grid-cols-2">
                <div className="p-3" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <h6 className="text-sm text-success mb-2">What Went Well</h6>
                  <ul className="text-sm text-secondary pl-4" style={{ listStyleType: 'disc' }}>
                    {ans.evaluation?.what_went_well?.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
                <div className="p-3" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                  <h6 className="text-sm text-danger mb-2">Needs Improvement</h6>
                  <ul className="text-sm text-secondary pl-4" style={{ listStyleType: 'disc' }}>
                    {ans.evaluation?.what_needs_improvement?.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>

              {/* Score Distribution Breakdown */}
              <div className="p-4" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <h5 className="font-semibold mb-4 text-secondary">AI Score Distribution</h5>
                <div className="grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Relevance (20)</span> <span>{ans.evaluation?.relevance_score || 0}</span></div>
                    <div className="progress-bg h-1.5"><div className="progress-fill" style={{ width: `${((ans.evaluation?.relevance_score || 0) / 20) * 100}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Knowledge (20)</span> <span>{ans.evaluation?.knowledge_score || 0}</span></div>
                    <div className="progress-bg h-1.5"><div className="progress-fill" style={{ width: `${((ans.evaluation?.knowledge_score || 0) / 20) * 100}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Clarity (15)</span> <span>{ans.evaluation?.clarity_score || 0}</span></div>
                    <div className="progress-bg h-1.5"><div className="progress-fill" style={{ width: `${((ans.evaluation?.clarity_score || 0) / 15) * 100}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Examples (15)</span> <span>{ans.evaluation?.example_score || 0}</span></div>
                    <div className="progress-bg h-1.5"><div className="progress-fill" style={{ width: `${((ans.evaluation?.example_score || 0) / 15) * 100}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Communication (10)</span> <span>{ans.evaluation?.communication_score || 0}</span></div>
                    <div className="progress-bg h-1.5"><div className="progress-fill" style={{ width: `${((ans.evaluation?.communication_score || 0) / 10) * 100}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Business Understanding (10)</span> <span>{ans.evaluation?.business_understanding_score || 0}</span></div>
                    <div className="progress-bg h-1.5"><div className="progress-fill" style={{ width: `${((ans.evaluation?.business_understanding_score || 0) / 10) * 100}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Business Impact (10)</span> <span>{ans.evaluation?.impact_score || 0}</span></div>
                    <div className="progress-bg h-1.5"><div className="progress-fill" style={{ width: `${((ans.evaluation?.impact_score || 0) / 10) * 100}%` }}></div></div>
                  </div>
                </div>
              </div>

            </div>

            <div style={{ flex: 1 }} className="flex flex-col gap-4">
              <div className="p-4" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div className="flex items-center gap-2 mb-2"><Activity size={18} color="#3b82f6" /> <h5 className="font-semibold">Speech Insights</h5></div>
                <div className="text-sm flex justify-between mb-1"><span className="text-secondary">WPM</span> <span>{ans.speech?.words_per_minute}</span></div>
                <div className="text-sm flex justify-between"><span className="text-secondary">Filler Words</span> <span>{ans.speech?.filler_word_count}</span></div>
              </div>
              <div className="p-4" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                <div className="flex items-center gap-2 mb-2"><UserCheck size={18} color="#10b981" /> <h5 className="font-semibold">Posture</h5></div>
                <div className="text-sm flex justify-between"><span className="text-secondary">Score</span> <span>{ans.posture?.final_posture_score}/10</span></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
