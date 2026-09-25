import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Sun, Moon, LogOut, User as UserIcon, Shield, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand-logo">
          <div className="brand-icon">
            <Calendar size={22} />
          </div>
          <div>
            <span style={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              LeavePulse
            </span>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              HR LEAVE SYSTEM
            </div>
          </div>
        </div>

        <div className="nav-actions">
          {/* Employee Leave Balance Pill */}
          {user.role === 'employee' && user.leaveBalance && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Sparkles size={14} />
                Casual: {user.leaveBalance.casual ?? 0}
              </div>

              <div style={{
                background: 'rgba(236, 72, 153, 0.12)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#f472b6',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Sparkles size={14} />
                Sick: {user.leaveBalance.sick ?? 0}
              </div>
            </div>
          )}

          {/* User Profile Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {user.role === 'manager' ? <Shield size={16} color="#a78bfa" /> : <UserIcon size={16} color="#60a5fa" />}
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
            <span className={`role-badge ${user.role}`}>
              {user.role}
            </span>
          </div>

          {/* Theme Switcher */}
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary btn-icon-only"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* Logout Button */}
          <button 
            onClick={logout} 
            className="btn btn-secondary" 
            style={{ padding: '0.5rem 0.85rem' }}
            title="Logout"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
