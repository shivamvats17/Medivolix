import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Building2, LogOut, ShieldCheck, ClipboardList, Menu, X, Code } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, isAuthenticated, isCustomer, isPharmacyAdmin, isSystemAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
      }}>
        {/* Brand Wordmark & Icon */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
        }}>
          <div className="navbar-logo-badge" style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '1.5px solid rgba(13, 148, 136, 0.25)',
            boxShadow: '0 2px 10px rgba(13, 148, 136, 0.18)',
            flexShrink: 0,
            overflow: 'hidden',
            padding: '2px',
          }}>
            <img
              src="/medivolix-icon.png"
              alt="Medivolix Brand Emblem"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{
              fontSize: '1.375rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
            }}>
              Medivolix
            </span>
            <span className="navbar-brand-tagline">
              The Right Medicine, Near You.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', md: 'flex', alignItems: 'center', gap: '24px' }} className="desktop-nav">
          <Link to="/search" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-main)',
            fontWeight: 500,
            fontSize: '0.9375rem',
          }}>
            <Search size={17} /> Search Medicines
          </Link>

          <Link to="/api-docs" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '0.9375rem',
          }}>
            <Code size={16} /> API Docs
          </Link>

          {/* Role specific links */}
          {isAuthenticated && isCustomer && (
            <Link to="/dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-main)',
              fontWeight: 500,
              fontSize: '0.9375rem',
            }}>
              <ClipboardList size={17} /> My Inquiries
            </Link>
          )}

          {isAuthenticated && isPharmacyAdmin && (
            <Link to="/pharmacy-dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.9375rem',
            }}>
              <Building2 size={17} /> Pharmacy Portal
            </Link>
          )}

          {isAuthenticated && isSystemAdmin && (
            <Link to="/admin" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#b91c1c',
              fontWeight: 600,
              fontSize: '0.9375rem',
            }}>
              <ShieldCheck size={17} /> Administration
            </Link>
          )}

          {/* User Account / Auth Actions */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                borderLeft: '1px solid var(--border-subtle)',
                paddingLeft: '16px',
              }}>
                {user.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out of session"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Theme Switcher Toggle */}
          <ThemeToggle />
        </nav>


        {/* Mobile Actions: Theme Toggle & Menu Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-actions">
          <ThemeToggle id="mobile-theme-toggle" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: 'var(--text-main)',
            }}
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>

          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontWeight: 500 }}
          >
            Search Medicines
          </Link>
          <Link
            to="/api-docs"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '8px 0', fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Code size={16} /> API Docs (OpenAPI)
          </Link>
          {isAuthenticated && isCustomer && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '8px 0', fontWeight: 500 }}
            >
              My Inquiries
            </Link>
          )}
          {isAuthenticated && isPharmacyAdmin && (
            <Link
              to="/pharmacy-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '8px 0', fontWeight: 600, color: 'var(--primary)' }}
            >
              Pharmacy Portal
            </Link>
          )}
          {isAuthenticated && isSystemAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '8px 0', fontWeight: 600, color: '#b91c1c' }}
            >
              Administration
            </Link>
          )}

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.fullName}</span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-actions { display: none !important; }
        }

      `}</style>
    </header>
  );
}
