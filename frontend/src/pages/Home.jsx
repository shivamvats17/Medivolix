import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '64px 0 56px 0',
      }}>
        <div className="container" style={{ maxWidth: '880px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary-dark)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '20px',
          }}>
            <ShieldCheck size={16} /> Transparent Stock Discovery for Patients
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: 1.2,
            marginBottom: '16px',
            letterSpacing: '-0.025em',
          }}>
            Find medicines at nearby pharmacies.
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '36px',
            maxWidth: '680px',
            margin: '0 auto 36px auto',
          }}>
            Search participating pharmacies, check their latest reported stock status, and contact them to confirm availability before visiting.
          </p>

          {/* Primary Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex',
            gap: '10px',
            maxWidth: '620px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '6px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--primary)',
            boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '12px', color: 'var(--text-muted)' }}>
              <Search size={20} />
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Search by medicine name, brand (e.g. Dolo 650), or generic composition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                boxShadow: 'none',
                padding: '12px 10px',
                fontSize: '1rem',
                flex: 1,
              }}
            />
            <button type="submit" className="btn btn-primary btn-lg" style={{ padding: '0 24px' }}>
              Search
            </button>
          </form>

          {/* Quick Common Searches */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '20px',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
          }}>
            <span>Sample searches:</span>
            {['Dolo 650', 'Augmentin 625', 'Azithral 500', 'Pan 40', 'Electral'].map((med) => (
              <button
                key={med}
                type="button"
                onClick={() => navigate(`/search?q=${encodeURIComponent(med)}`)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '3px 8px',
                  color: 'var(--primary)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                {med}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency Disclaimer Notice */}
      <section style={{ backgroundColor: '#f8fafc', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="disclaimer-banner" style={{ margin: 0 }}>
            <AlertTriangle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Stock Freshness Notice:</strong> Stock information is reported directly by participating pharmacies and may fluctuate in real time. We recommend calling or submitting an in-app inquiry to confirm stock before travelling.
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step How It Works Section */}
      <section style={{ padding: '64px 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px' }}>
              How Medivolix Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              A straightforward three-step workflow to save unnecessary visits and phone calls.
            </p>
          </div>

          <div className="grid-3">
            {/* Step 1 */}
            <div className="card" style={{ textAlign: 'left', borderTop: '4px solid var(--primary)' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.125rem',
                marginBottom: '16px',
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>
                Search for a medicine
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Type the brand name, exact active ingredient, or dosage form into the catalog search bar to view matching entries.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ textAlign: 'left', borderTop: '4px solid var(--accent)' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.125rem',
                marginBottom: '16px',
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>
                Compare reported availability
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Review participating pharmacies reporting current inventory, checking last-updated timestamps and proximity distance.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ textAlign: 'left', borderTop: '4px solid #059669' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#d1fae5',
                color: '#059669',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.125rem',
                marginBottom: '16px',
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>
                Contact or request confirmation
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Call the pharmacy using the verified contact number or submit an availability request before heading to the store.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stock Freshness & Quality Standards */}
      <section style={{ padding: '64px 0', backgroundColor: 'var(--bg-page)' }}>
        <div className="container">
          <div className="card" style={{ padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '14px' }}>
                  Responsible Stock Freshness Standards
                </h2>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  Medivolix never assumes that inventory remains static. Every listing displays the exact timestamp of the pharmacy’s last stock update.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <strong>24-Hour Threshold:</strong> Records not refreshed within 24 hours are clearly labeled as <em>Stock Information Outdated</em>.
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <strong>Expiry Exclusion:</strong> Pharmacy inventory systems automatically exclude expired batches from publicly reportable stock.
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <strong>Prescription Awareness:</strong> Regulated medications explicitly display prescription requirements to maintain compliance.
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                padding: '28px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)',
              }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '10px' }}>
                  Are you a Licensed Pharmacy?
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Manage stock quantities, review incoming patient availability inquiries, and track approaching expiry dates through the pharmacy portal.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to="/login" className="btn btn-primary">
                    Pharmacy Portal Login
                  </Link>
                  <Link to="/search" className="btn btn-secondary">
                    Browse Catalog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
