import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2 } from 'lucide-react';

export default function Processing() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, we would poll the backend or use WebSocket to check if all answers are EVALUATED.
    // For MVP, we'll wait 5 seconds and call the complete endpoint, then redirect.
    const completeInterview = async () => {
      try {
        await api.post(`/ai-interviews/attempts/${attemptId}/complete`);
        navigate(`/attempt/${attemptId}/report`);
      } catch (e) {
        console.error(e);
        navigate(`/attempt/${attemptId}/report`); // fallback navigation
      }
    };

    const timer = setTimeout(completeInterview, 5000);
    return () => clearTimeout(timer);
  }, [attemptId, navigate]);

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <Loader2 size={64} color="var(--accent-primary)" className="mb-6 mx-auto" style={{ animation: 'spin 2s linear infinite' }} />
        <h2 className="text-2xl mb-4">Evaluating your performance...</h2>
        <p className="text-secondary mb-8 max-w-md mx-auto">
          Our AI is analyzing your transcript, speech patterns, and body language to generate your personalized report.
        </p>
        
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
