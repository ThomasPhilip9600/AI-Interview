import { useState, useEffect } from 'react';
import api from '../services/api';
import { PlusCircle, Plus, ChevronDown } from 'lucide-react';

export default function AdminPortal() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [description, setDescription] = useState('');

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [prepTime, setPrepTime] = useState(15);
  const [answerTime, setAnswerTime] = useState(60);

  const fetchTemplates = () => {
    api.get('/ai-interviews/templates')
      .then(res => {
        setTemplates(res.data.templates);
        if (res.data.templates.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(res.data.templates[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/ai-interviews/admin/templates', {
        title, category, target_role: targetRole, difficulty, description
      });
      alert('Template created successfully!');
      setTitle('');
      setDescription('');
      setCategory('');
      setTargetRole('');
      fetchTemplates();
      setSelectedTemplateId(res.data.id);
    } catch (err) {
      alert('Error creating template: ' + err.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedTemplateId) return alert('Select a template first!');
    
    // Auto calculate order_index based on existing questions (mocking by just using total_questions + 1)
    const template = templates.find(t => t.id === selectedTemplateId);
    const order_index = (template?.total_questions || 0) + 1;

    try {
      await api.post('/ai-interviews/admin/questions', {
        template_id: selectedTemplateId,
        question_text: questionText,
        preparation_time: prepTime,
        answer_time_limit: answerTime,
        order_index
      });
      alert('Question added successfully!');
      setQuestionText('');
      fetchTemplates(); // refresh counts
    } catch (err) {
      alert('Error adding question: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col items-center pb-12">
      <div className="w-full max-w-5xl" style={{ marginTop: '2rem' }}>
        <h2 className="text-3xl mb-8 text-gradient text-center">Admin Portal</h2>

        <div className="flex gap-8 items-start w-full" style={{ flexDirection: 'row' }}>
          
          {/* Create Template Form */}
          <div className="card flex-1 w-full" style={{ background: 'linear-gradient(to bottom right, rgba(20,21,24,0.9), rgba(139,92,246,0.05))' }}>
            <h3 className="text-xl mb-6 flex items-center gap-2 text-secondary pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <PlusCircle size={20} /> Create New Template
            </h3>
            <form onSubmit={handleCreateTemplate} className="flex flex-col gap-5">
              <div>
                <label className="text-sm text-secondary block mb-1">Title</label>
                <input 
                  type="text" 
                  className="w-full p-3 rounded" 
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="e.g. React Fundamentals"
                  value={title} onChange={e => setTitle(e.target.value)} required 
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-secondary block mb-1">Category</label>
                  <input type="text" className="w-full p-3 rounded" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="Frontend" value={category} onChange={e => setCategory(e.target.value)} required />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-secondary block mb-1">Difficulty</label>
                  <select className="w-full p-3 rounded" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-secondary block mb-1">Target Role</label>
                <input type="text" className="w-full p-3 rounded" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="e.g. Software Engineer" value={targetRole} onChange={e => setTargetRole(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm text-secondary block mb-1">Description</label>
                <textarea className="w-full p-3 rounded h-24" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary mt-2 p-3 text-md font-bold hover:shadow-lg hover:shadow-[var(--accent-glow)] transition-all">Create Template</button>
            </form>
          </div>

          {/* Add Question Form */}
          <div className="card flex-1 w-full" style={{ background: 'linear-gradient(to bottom right, rgba(20,21,24,0.9), rgba(16,185,129,0.05))' }}>
            <h3 className="text-xl mb-6 flex items-center gap-2 text-secondary pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <Plus size={20} /> Add Question
            </h3>
            <form onSubmit={handleAddQuestion} className="flex flex-col gap-5">
              <div>
                <label className="text-sm text-secondary block mb-1">Select Template</label>
                <select 
                  className="w-full p-3 rounded" 
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  value={selectedTemplateId} 
                  onChange={e => setSelectedTemplateId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Template --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.total_questions} Qs)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-secondary block mb-1">Question Text</label>
                <textarea className="w-full p-3 rounded h-32" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="e.g. What is the Virtual DOM?" value={questionText} onChange={e => setQuestionText(e.target.value)} required />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-secondary block mb-1">Prep Time (sec)</label>
                  <input type="number" className="w-full p-3 rounded" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} required />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-secondary block mb-1">Answer Time (sec)</label>
                  <input type="number" className="w-full p-3 rounded" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} value={answerTime} onChange={e => setAnswerTime(Number(e.target.value))} required />
                </div>
              </div>
              <button type="submit" className="btn btn-secondary mt-2 p-3 text-md font-bold" disabled={!selectedTemplateId}>Add Question</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
