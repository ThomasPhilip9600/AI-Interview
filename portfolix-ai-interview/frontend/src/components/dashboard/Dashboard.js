import React from 'react';
import CategoryList from './CategoryList';
import AttemptHistory from './AttemptHistory';
import { Award, BookOpen, GraduationCap, Video } from 'lucide-react';

export default function Dashboard({ 
  questions, 
  history, 
  onSelectCategory, 
  onViewReport 
}) {
  // Aggregate top level metrics
  const completedAttempts = history.filter(a => a.status === 'completed' || a.answers_count > 0);
  const totalAttempts = completedAttempts.length;
  
  const averageScore = React.useMemo(() => {
    if (totalAttempts === 0) return 0;
    const sum = completedAttempts.reduce((acc, a) => acc + (a.avg_score || 0), 0);
    return Math.round(sum / totalAttempts);
  }, [completedAttempts, totalAttempts]);

  return (
    <div className="dashboard-container">
      {/* Dashboard Top Banner */}
      <div className="dashboard-banner glass-card bg-gradient-to-r from-violet-900/60 to-fuchsia-950/40">
        <div className="banner-content">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="text-violet-400" size={32} />
            <span className="banner-logo">Portfolix AI Interview Prep</span>
          </div>
          <h1 className="banner-title">Welcome to your AI Interview Simulator</h1>
          <p className="banner-subtitle">
            Practice real-time technical and soft-skill questions, get instant posture analysis, and receive detailed scores based on corporate rubrics.
          </p>
        </div>
        
        <div className="banner-illustrations">
          <div className="pulsing-radar-circle">
            <Video size={48} className="text-violet-400" />
          </div>
        </div>
      </div>

      {/* Main Grid: Category List */}
      <div className="dashboard-grid">
        <CategoryList 
          questions={questions} 
          onSelectCategory={onSelectCategory} 
        />
      </div>

      {/* Analytics & Attempt History Logs */}
      <div className="dashboard-history-section">
        <div className="section-header">
          <h2 className="section-title">Your Progress Dashboard</h2>
          <p className="section-subtitle">Track your performance levels and review detailed feedback reports.</p>
        </div>
        
        <AttemptHistory 
          history={history} 
          onViewReport={onViewReport} 
        />
      </div>
    </div>
  );
}
