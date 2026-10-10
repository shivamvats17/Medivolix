import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container" style={{ maxWidth: '520px', padding: '64px 16px', textAlign: 'center' }}>
      <div className="card" style={{ padding: '48px 32px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'var(--bg-surface-secondary)',
          color: 'var(--text-muted)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}>
          <FileQuestion size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
          404 - Page Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The page or route you requested could not be found. Check the URL address or return to the medicine search catalog.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} /> Return Home
          </Link>
          <Link to="/search" className="btn btn-primary">
            <Search size={16} /> Search Medicines
          </Link>
        </div>
      </div>
    </div>
  );
}
