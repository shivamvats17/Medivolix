import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Shield, FileText } from 'lucide-react';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      borderTop: '1px solid #1e293b',
      padding: '48px 0 24px 0',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '36px',
          marginBottom: '36px',
        }}>
          {/* Column 1: Brand & Purpose */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <img
                src="/medivolix-logo.jpg"
                alt="Medivolix Logo"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  objectFit: 'contain',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.15 }}>
                  Medivolix
                </span>
                <span style={{ fontSize: '0.725rem', color: '#2dd4bf', fontStyle: 'italic', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                  The Right Medicine, Near You.
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Community medicine availability platform across Jaipur, Jodhpur, Delhi NCR, and nearby regions. Enabling patients to locate stock across licensed pharmacies and confirm before travelling.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li>
                <Link to="/search" style={{ color: '#cbd5e1' }}>Search Medicines</Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#cbd5e1' }}>Pharmacy Portal Login</Link>
              </li>
              <li>
                <Link to="/register" style={{ color: '#cbd5e1' }}>Register Customer Account</Link>
              </li>
              <li>
                <Link to="/api-docs" style={{ color: '#cbd5e1' }}>REST API Docs (OpenAPI 3.0)</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Governance */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
              Transparency &amp; Legal
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li>
                <Link to="/privacy-policy" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Clinical Disclaimer */}
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
              Regulatory Notice
            </h4>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: '#94a3b8',
              lineHeight: 1.5,
              border: '1px solid #334155',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 600, marginBottom: '4px' }}>
                <AlertCircle size={14} /> Availability Disclaimer
              </div>
              Medivolix is an availability discovery platform, not a pharmacy or medical clinic. Reported stock is submitted by participating pharmacies and may fluctuate. Please contact the dispensing pharmacy directly to verify requirements and current stock.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.8125rem',
          color: '#64748b',
        }}>
          <div>
            &copy; {currentYear} Medivolix. All rights reserved.
          </div>
          <div>
            Demonstration full-stack project built with React, Core Java Servlets, and MySQL.
          </div>
        </div>
      </div>
    </footer>
  );
}
