import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { History as HistoryIcon, ArrowRight, BarChart } from 'lucide-react';

export default function History() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/ai-interviews/my-attempts')
      .then(res => {
        setAttempts(res.data.attempts || []);
        setLoading(false);
      })
      .catch(err => {
        // Mock fallback
        setAttempts([
          { id: '1', template_title: 'Full Stack Developer', status: 'COMPLETED', final_score: 82, started_at: new Date().toISOString() },
          { id: '2', template_title: 'UI/UX Designer', status: 'IN_PROGRESS', final_score: null, started_at: new Date().toISOString() }
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-8">Loading history...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <HistoryIcon size={24} color="var(--accent-primary)" />
        <h2 className="text-2xl">Attempt History</h2>
      </div>

      {attempts.length === 0 ? (
        <div className="card text-center p-8">
          <p className="text-secondary mb-4">You haven't completed any mock interviews yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/categories')}>Browse Categories</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {attempts.map(attempt => (
            <div key={attempt.id} className="card flex items-center justify-between">
              <div>
                <h3 className="text-lg mb-1">{attempt.template_title}</h3>
                <p className="text-sm text-secondary">{new Date(attempt.started_at).toLocaleDateString()}</p>
              </div>
              
              <div className="flex items-center gap-8">
                {attempt.status === 'COMPLETED' ? (
                  <>
                    <div className="text-right">
                      <div className="text-sm text-secondary uppercase tracking-widest">Score</div>
                      <div className="text-xl font-bold" style={{ color: attempt.final_score > 70 ? 'var(--success)' : 'var(--warning)' }}>
                        {attempt.final_score?.toFixed(0)}/100
                      </div>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate(`/attempt/${attempt.id}/report`)}>
                      <BarChart size={18} /> View Report
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-warning">IN PROGRESS</div>
                    <button className="btn btn-secondary">Resume <ArrowRight size={18} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
