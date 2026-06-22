import React from 'react';
import { 
  Palette, 
  Code, 
  Terminal, 
  Smartphone, 
  TrendingUp, 
  Users, 
  ChevronRight 
} from 'lucide-react';

const categoryMeta = {
  'UI/UX': { 
    icon: Palette, 
    color: 'from-pink-500 to-rose-500', 
    desc: 'Focuses on user research, responsive layouts, accessibility, and visual guidelines.' 
  },
  'Flutter': { 
    icon: Smartphone, 
    color: 'from-blue-500 to-indigo-500', 
    desc: 'Covers StatelessWidget, Statefulness, Bloc/Provider patterns, and compilation.' 
  },
  'Full Stack': { 
    icon: Code, 
    color: 'from-purple-500 to-violet-500', 
    desc: 'Covers database architectures, server-side design, security, and RESTful routing.' 
  },
  'Python': { 
    icon: Terminal, 
    color: 'from-amber-500 to-yellow-500', 
    desc: 'Covers list comprehensions, decorators, generators, and performance optimization.' 
  },
  'Digital Marketing': { 
    icon: TrendingUp, 
    color: 'from-emerald-500 to-teal-500', 
    desc: 'Covers search engine optimization (SEO), campaigns, conversion rates, and Analytics.' 
  },
  'HR': { 
    icon: Users, 
    color: 'from-cyan-500 to-blue-500', 
    desc: 'Covers behavior scenarios, STAR method conflict resolutions, and cultural fits.' 
  }
};

export default function CategoryList({ questions, onSelectCategory }) {
  // Extract unique categories and count questions
  const categories = React.useMemo(() => {
    const counts = {};
    questions.forEach(q => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });

    return Object.keys(counts).map(name => {
      const meta = categoryMeta[name] || {
        icon: Code,
        color: 'from-slate-500 to-gray-500',
        desc: 'Custom interview category.'
      };
      return {
        name,
        count: counts[name],
        ...meta
      };
    });
  }, [questions]);

  return (
    <div className="category-section">
      <h2 className="section-title">Select Interview Category</h2>
      <p className="section-subtitle">Pick a placement-aligned domain to start practicing mock interviews with real-time feedback.</p>
      
      <div className="grid-layout">
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <div 
              key={cat.name} 
              className="glass-card hover-glow category-card clickable"
              onClick={() => onSelectCategory(cat.name)}
            >
              <div className={`icon-wrapper bg-gradient-to-r ${cat.color}`}>
                <IconComponent size={24} className="text-white" />
              </div>
              <div className="category-body">
                <div className="category-header">
                  <h3 className="category-name">{cat.name}</h3>
                  <span className="badge badge-accent">{cat.count} Questions</span>
                </div>
                <p className="category-desc">{cat.desc}</p>
                <div className="category-footer">
                  <span className="action-text">Prepare Domain</span>
                  <ChevronRight size={16} className="arrow-icon" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
