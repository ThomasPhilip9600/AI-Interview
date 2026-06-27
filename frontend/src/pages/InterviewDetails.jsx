import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock, HelpCircle, ArrowRight } from 'lucide-react';

export default function InterviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  const [difficulty, setDifficulty] = useState('Beginner');
  const [selfIntroDuration, setSelfIntroDuration] = useState('2');

  useEffect(() => {
    api.get(`/ai-interviews/templates/${id}`)
      .then(res => {
        setTemplate(res.data.template);
        setLoading(false);
      })
      .catch(err => {
        // Fallback for UI testing
        setTemplate({ id, title: 'Full Stack Developer', description: 'Test your React and Node.js skills.', total_questions: 5 });
        setLoading(false);
      });
  }, [id]);

  const startInterview = async () => {
    try {
      const res = await api.post(`/ai-interviews/${id}/start`, { 
        difficulty,
        selfIntroDuration: parseInt(selfIntroDuration, 10)
      });
      const { attemptId } = res.data;
      navigate(`/interview/${attemptId}/setup`);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to start interview. Ensure the template ID exists in the database.");
    }
  };

  if (loading) return <div className="text-center mt-8">Loading details...</div>;

  return (
    <div className="animate-fade-in flex flex-col items-center">
      <div className="card w-full" style={{ maxWidth: '600px', marginTop: '2rem' }}>
        <h2 className="text-2xl mb-4 text-gradient">{template?.title}</h2>
        <p className="text-secondary mb-6">{template?.description}</p>
        
        <div className="flex gap-6 mb-6 p-4" style={{ background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
          <div className="flex items-center gap-2">
            <HelpCircle size={20} color="var(--accent-primary)" />
            <span>{template?.total_questions} Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={20} color="var(--success)" />
            <span>~10 Mins Total</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm text-secondary block mb-2">Select Your Difficulty Level:</label>
          <select 
            className="w-full p-3 rounded" 
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="mb-8">
          <label className="text-sm text-secondary block mb-2">Self Introduction Duration:</label>
          <select 
            className="w-full p-3 rounded" 
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            value={selfIntroDuration} 
            onChange={(e) => setSelfIntroDuration(e.target.value)}
          >
            <option value="2">2 Minutes</option>
            <option value="3">3 Minutes</option>
            <option value="5">5 Minutes</option>
          </select>
        </div>

        <button onClick={startInterview} className="btn btn-primary w-full" style={{ padding: '16px' }}>
          Start Setup <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
