import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Key, UserCheck, Building2, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.returnUrl;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedUser = await login(email.trim(), password);
      if (returnUrl) {
        navigate(returnUrl);
      } else if (loggedUser.role === 'SYSTEM_ADMIN') {
        navigate('/admin');
      } else if (loggedUser.role === 'PHARMACY_ADMIN') {
        navigate('/pharmacy-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for development/evaluation demonstration
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="container" style={{ maxWidth: '460px', padding: '48px 16px' }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
          }}>
            <LogIn size={22} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Account Login</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Access your patient inquiries or pharmacy inventory
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '16px',
        }}>
          Don’t have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Register as Customer
          </Link>
        </div>

        {/* Development Seed Accounts Demo Panel */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: 'var(--bg-surface-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-strong)',
          fontSize: '0.8125rem',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={14} /> Evaluation Demonstration Accounts:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@medivolix.com', 'Admin@1234')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
            >
              <ShieldCheck size={13} style={{ color: '#dc2626' }} />
              Admin (admin@medivolix.com)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('careplus@medivolix.com', 'Pharmacy@1234')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
            >
              <Building2 size={13} style={{ color: 'var(--primary)' }} />
              Pharmacy Admin (careplus@medivolix.com)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('john.doe@example.com', 'Customer@1234')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
            >
              <UserCheck size={13} style={{ color: 'var(--accent)' }} />
              Customer (john.doe@example.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
