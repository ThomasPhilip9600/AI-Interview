import React from 'react';
import { 
  History, 
  TrendingUp, 
  Award, 
  Calendar, 
  Eye, 
  BookOpen 
} from 'lucide-react';

export default function AttemptHistory({ history, onViewReport }) {
  const completedAttempts = React.useMemo(() => {
    return history.filter(a => a.status === 'completed' || a.answers_count > 0);
  }, [history]);

  // Compute stats
  const stats = React.useMemo(() => {
    if (completedAttempts.length === 0) return { avg: 0, high: 0, count: 0 };
    const scores = completedAttempts.map(a => a.avg_score || 0);
    const sum = scores.reduce((acc, s) => acc + s, 0);
    return {
      avg: Math.round(sum / completedAttempts.length),
      high: Math.max(...scores),
      count: completedAttempts.length
    };
  }, [completedAttempts]);

  // Render SVG improvement chart
  const renderChart = () => {
    if (completedAttempts.length < 2) {
      return (
        <div className="chart-empty-state">
          <TrendingUp size={24} className="text-slate-500 mb-2" />
          <p>Complete 2 or more interviews to plot your improvement trajectory.</p>
        </div>
      );
    }

    // Sort chronologically for charting
    const chartData = [...completedAttempts]
      .reverse()
      .map((a, i) => ({
        index: i,
        score: a.avg_score || 0,
        label: a.category
      }));

    const width = 600;
    const height = 180;
    const padding = 25;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const pointsCount = chartData.length;
    const getX = (index) => padding + (index / (pointsCount - 1)) * chartWidth;
    const getY = (score) => padding + chartHeight - (score / 100) * chartHeight;

    // Build SVG path
    let d = '';
    let areaD = '';
    
    chartData.forEach((pt, idx) => {
      const cx = getX(pt.index);
      const cy = getY(pt.score);
      
      if (idx === 0) {
        d = `M ${cx} ${cy}`;
        areaD = `M ${cx} ${padding + chartHeight} L ${cx} ${cy}`;
      } else {
        d += ` L ${cx} ${cy}`;
      }
      
      if (idx === pointsCount - 1) {
        areaD += ` L ${cx} ${cy} L ${cx} ${padding + chartHeight} Z`;
      }
    });

    return (
      <div className="chart-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="improvement-svg">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(val => {
            const gy = getY(val);
            return (
              <g key={val}>
                <line 
                  x1={padding} 
                  y1={gy} 
                  x2={width - padding} 
                  y2={gy} 
                  stroke="rgba(255,255,255,0.08)" 
                  strokeWidth="1" 
                />
                <text 
                  x={padding - 5} 
                  y={gy + 4} 
                  fill="#94a3b8" 
                  fontSize="9" 
                  textAnchor="end"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area fill under the line */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Line path */}
          <path 
            d={d} 
            fill="none" 
            stroke="#a78bfa" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Data Nodes */}
          {chartData.map((pt) => {
            const cx = getX(pt.index);
            const cy = getY(pt.score);
            return (
              <g key={pt.index} className="chart-node">
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r="6" 
                  fill="#1e1b4b" 
                  stroke="#a78bfa" 
                  strokeWidth="2.5" 
                />
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r="12" 
                  fill="#a78bfa" 
                  fillOpacity="0"
                  className="hover:fill-opacity-10 cursor-pointer transition-all duration-200"
                />
                <text 
                  x={cx} 
                  y={cy - 12} 
                  fill="#f8fafc" 
                  fontSize="9.5" 
                  fontWeight="bold"
                  textAnchor="middle"
                  className="node-value bg-slate-900 px-1 rounded"
                >
                  {pt.score}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="history-section">
      <div className="stats-cards-layout">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper bg-violet-900/40 text-violet-400">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="stat-label">Total Attempts</div>
            <div className="stat-value">{stats.count}</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper bg-emerald-900/40 text-emerald-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-label">Average Score</div>
            <div className="stat-value">{stats.avg}%</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper bg-amber-900/40 text-amber-400">
            <Award size={20} />
          </div>
          <div>
            <div className="stat-label">Highest Score</div>
            <div className="stat-value">{stats.high}%</div>
          </div>
        </div>
      </div>

      <div className="history-layout">
        {/* Improvement Graph */}
        <div className="glass-card chart-panel">
          <h3 className="panel-title flex items-center gap-2">
            <TrendingUp size={16} className="text-violet-400" />
            Performance Trajectory
          </h3>
          <p className="panel-desc">Shows average scorecard trends across your completed interviews.</p>
          {renderChart()}
        </div>

        {/* History Logs */}
        <div className="glass-card logs-panel">
          <h3 className="panel-title flex items-center gap-2">
            <History size={16} className="text-violet-400" />
            Previous Session Logs
          </h3>
          
          {completedAttempts.length === 0 ? (
            <div className="logs-empty-state">
              <p>No completed interviews found. Start your first practice session above!</p>
            </div>
          ) : (
            <div className="logs-list">
              {completedAttempts.map(attempt => (
                <div key={attempt.id} className="log-row">
                  <div className="log-info">
                    <h4 className="log-category">{attempt.category} Practice</h4>
                    <span className="log-time">
                      <Calendar size={10} className="inline mr-1" />
                      {formatDate(attempt.created_at)}
                    </span>
                  </div>
                  
                  <div className="log-stats">
                    <div className="log-answers-badge">
                      {attempt.answers_count} Answer(s)
                    </div>
                    <div className="log-score-badge bg-gradient-to-r from-violet-600 to-indigo-600">
                      Score: {attempt.avg_score}%
                    </div>
                    <button 
                      className="btn btn-secondary btn-icon view-btn"
                      onClick={() => onViewReport(attempt.id)}
                    >
                      <Eye size={12} />
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
