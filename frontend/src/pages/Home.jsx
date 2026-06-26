import { Link } from 'react-router-dom';
import { ArrowRight, Play, Award, BarChart2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="animate-fade-in flex flex-col gap-8">
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: 'linear-gradient(to bottom right, rgba(20,21,24,0.8), rgba(139,92,246,0.1))' }}>
        <h1 className="text-2xl mb-4 text-gradient" style={{ fontSize: '2.5rem' }}>Master Your Next Interview</h1>
        <p className="text-secondary mb-8" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Practice with AI-driven mock interviews, get real-time feedback on your answers, speech, and posture, and be placement-ready.
        </p>
        <Link to="/categories" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
          <Play size={20} />
          Start Practice
        </Link>
      </div>

      <div className="grid-cols-3">
        <div className="card">
          <Award size={32} color="var(--accent-primary)" className="mb-4" />
          <h3 className="text-xl mb-2">Role-Specific Practice</h3>
          <p className="text-sm">Tailored questions for Frontend, Backend, UI/UX, and more based on real-world rubrics.</p>
        </div>
        <div className="card">
          <BarChart2 size={32} color="var(--success)" className="mb-4" />
          <h3 className="text-xl mb-2">Detailed Analytics</h3>
          <p className="text-sm">Get comprehensive reports on your knowledge, clarity, filler words, and body language.</p>
        </div>
        <div className="card">
          <Play size={32} color="var(--warning)" className="mb-4" />
          <h3 className="text-xl mb-2">Unlimited Replays</h3>
          <p className="text-sm">Watch your own recordings side-by-side with AI-refined ideal answers to spot mistakes.</p>
        </div>
      </div>
    </div>
  );
}
