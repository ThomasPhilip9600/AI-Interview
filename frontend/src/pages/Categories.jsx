import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, Code, Palette, Megaphone } from 'lucide-react';

export default function Categories() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch mock templates
    api.get('/ai-interviews/templates')
      .then(res => {
        setTemplates(res.data.templates || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        // Fallback for UI if backend is not up
        setTemplates([
          { id: '1', title: 'Full Stack Developer', category: 'Engineering', difficulty: 'INTERMEDIATE', total_questions: 5 },
          { id: '2', title: 'UI/UX Designer', category: 'Design', difficulty: 'BEGINNER', total_questions: 3 },
          { id: '3', title: 'Product Manager', category: 'Management', difficulty: 'ADVANCED', total_questions: 4 },
        ]);
        setLoading(false);
      });
  }, []);

  const getIcon = (category) => {
    if (category.includes('Engine')) return <Code size={24} color="var(--accent-primary)" />;
    if (category.includes('Design')) return <Palette size={24} color="#ec4899" />;
    if (category.includes('Manage')) return <Briefcase size={24} color="#eab308" />;
    return <Megaphone size={24} color="#3b82f6" />;
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl mb-2">Interview Categories</h2>
      <p className="text-sm mb-8">Select a role to start your AI mock interview practice.</p>

      {loading ? (
        <div className="text-center mt-8">Loading available interviews...</div>
      ) : (
        <div className="grid-cols-2">
          {templates.map(template => (
            <div 
              key={template.id} 
              className="card interactive flex items-center justify-between"
              onClick={() => navigate(`/interview/${template.id}`)}
            >
              <div className="flex items-center gap-4">
                <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                  {getIcon(template.category)}
                </div>
                <div>
                  <h3 className="text-xl mb-1">{template.title}</h3>
                  <div className="flex gap-2 text-sm">
                    <span style={{ color: 'var(--accent-primary)' }}>{template.difficulty}</span>
                    <span>•</span>
                    <span>{template.total_questions} Questions</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>View</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
