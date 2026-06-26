import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Settings, PlayCircle } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Interviews', path: '/categories', icon: PlayCircle },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <div className="app-container">
      <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-2">
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 100%)', borderRadius: '8px' }}></div>
          <h1 className="text-xl">Portfolix <span className="text-gradient">AI</span></h1>
        </div>
        <nav className="flex gap-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'color 0.2s'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div>
          {/* User profile stub */}
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            TS
          </div>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
