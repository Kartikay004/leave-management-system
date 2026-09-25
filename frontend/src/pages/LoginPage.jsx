import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Shield, User, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const { login, register, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!name.trim()) {
          setError('Name is required for registration.');
          setLoading(false);
          return;
        }
        const user = await register(name, email, password);
        navigate(user.role === 'manager' ? '/manager' : '/employee');
      } else {
        const user = await login(email, password);
        navigate(user.role === 'manager' ? '/manager' : '/employee');
      }
    } catch (err) {
      console.error("Auth error:", err);
      const msg = err.response?.data?.message || 'Authentication failed. Please check credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Demo Login Quick Button handlers
  const handleManagerDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await login('aman@gmail.com', '12345678');
      navigate('/manager');
    } catch (err) {
      setError('Manager demo account login failed. Ensure manager is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 40%), radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.12), transparent 40%)'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Brand Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
            marginBottom: '1rem'
          }}>
            <Calendar size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LeavePulse
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Modern Leave Request & Approval Management System
          </p>
        </div>

        {/* Auth Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <div className="tabs" style={{ justifyContent: 'center' }}>
            <button
              type="button"
              className={`tab-btn ${!isRegistering ? 'active' : ''}`}
              onClick={() => { setIsRegistering(false); setError(''); }}
              style={{ flex: 1 }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`tab-btn ${isRegistering ? 'active' : ''}`}
              onClick={() => { setIsRegistering(true); setError(''); }}
              style={{ flex: 1 }}
            >
              Register Employee
            </button>
          </div>

          {error && (
            <div className="alert-banner danger">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
              disabled={loading}
            >
              {loading ? 'Processing...' : (isRegistering ? 'Create Employee Account' : 'Sign In')}
            </button>
          </form>

          {/* Quick Demo Login Bar */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
              One-Click Demo Access
            </div>
            <button
              type="button"
              onClick={handleManagerDemoLogin}
              className="btn btn-secondary"
              style={{ width: '100%', borderColor: 'rgba(139, 92, 246, 0.4)', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}
              disabled={loading}
            >
              <Shield size={16} />
              Login as Manager (Aman)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
