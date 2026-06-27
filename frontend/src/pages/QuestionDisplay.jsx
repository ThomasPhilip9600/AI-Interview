import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import api from '../services/api';

export default function QuestionDisplay() {
  const { attemptId, index } = useParams();
  const navigate = useNavigate();
  const [prepTime, setPrepTime] = useState(10);
  const [questionText, setQuestionText] = useState('Loading question...');
  const [isSelfIntro, setIsSelfIntro] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(1);
  
  useEffect(() => {
    // Fetch actual questions for the attempt
    api.get(`/ai-interviews/attempts/${attemptId}`)
      .then(res => {
        const questions = res.data.questions;
        const qIndex = parseInt(index);
        if (questions && questions.length > qIndex) {
          setQuestionText(questions[qIndex].question_text);
          setPrepTime(questions[qIndex].preparation_time || 10);
          
          setIsSelfIntro(questions[qIndex].id === 'self-intro');
          const offset = questions[0]?.id === 'self-intro' ? 0 : 1;
          setDisplayNumber(parseInt(index) + offset);
        } else {
          setQuestionText("No more questions.");
          setPrepTime(0);
        }
      })
      .catch(err => {
        console.error(err);
        setQuestionText("Failed to load question.");
      });
  }, [attemptId, index]);

  useEffect(() => {
    if (questionText === 'Loading question...' || questionText === 'Failed to load question.') return;
    
    if (prepTime > 0) {
      const timer = setTimeout(() => setPrepTime(prepTime - 1), 1000);
      return () => clearTimeout(timer);
    } else if (questionText !== 'No more questions.') {
      // Auto transition to recording when time is up
      navigate(`/attempt/${attemptId}/record/${index}`);
    }
  }, [prepTime, attemptId, index, navigate, questionText]);

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
      <div className="text-center mb-8">
        <h3 className="text-secondary mb-2 uppercase tracking-widest text-sm">
          {isSelfIntro ? 'Self Introduction' : `Question ${displayNumber}`}
        </h3>
        <h2 className="text-2xl max-w-2xl" style={{ lineHeight: 1.6 }}>{questionText}</h2>
      </div>

      <div className="card flex flex-col items-center mt-8" style={{ padding: '2rem 4rem', borderColor: 'var(--accent-primary)', boxShadow: '0 0 20px var(--accent-glow)' }}>
        <Clock size={32} color="var(--accent-primary)" className="mb-4" />
        <div className="text-sm text-secondary uppercase tracking-widest mb-2">Preparation Time</div>
        <div className="text-gradient" style={{ fontSize: '3rem', fontWeight: 700 }}>00:{prepTime.toString().padStart(2, '0')}</div>
        <p className="text-sm mt-4">Get ready to record your answer.</p>
      </div>
      
      <button 
        className="btn btn-secondary mt-8"
        onClick={() => navigate(`/attempt/${attemptId}/record/${index}`)}
      >
        Skip Wait & Start Now
      </button>
    </div>
  );
}
