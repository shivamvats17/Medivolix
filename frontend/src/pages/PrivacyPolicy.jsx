import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, FileText, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="container" style={{ maxWidth: '840px', padding: '40px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Shield size={28} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Privacy Policy</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '32px' }}>
          Last Updated: October 2026 &bull; Medivolix Platform Governance
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>1. Introduction &amp; Scope</h2>
            <p>
              Medivolix ("we", "our", or "platform") operates a medicine availability discovery and pharmacy locator service. This Privacy Policy explains our practices regarding the collection, processing, storage, and protection of information when you use our web application.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>2. Information We Collect</h2>
            <p>We collect limited information strictly necessary to facilitate medicine availability discovery:</p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Customer Account Data:</strong> Name, email address, telephone number, and encrypted password credentials (hashed with BCrypt).</li>
              <li><strong>Inquiry Details:</strong> Requested medicine, quantity, and optional notes provided when submitting availability requests to pharmacies.</li>
              <li><strong>Pharmacy Records:</strong> Store trade name, drug license number, operating address, contact telephone, email, and reported medicine inventory quantities.</li>
              <li><strong>Location Data:</strong> When explicitly granted by your browser, approximate latitude and longitude coordinates are processed client-side to calculate distance to nearby pharmacies.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>3. How We Use Collected Information</h2>
            <p>Your information is used solely to:</p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Connect patients with participating pharmacies reporting required medicines.</li>
              <li>Route in-app availability inquiries directly to the selected pharmacy for confirmation.</li>
              <li>Maintain regulatory accountability and audit logs for stock changes made by pharmacy staff.</li>
              <li>Authenticate authorized access for customer, pharmacy, and system administrator roles.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>4. Health Information Notice</h2>
            <p>
              <strong>Medivolix does not collect electronic health records, diagnostic summaries, or full medical histories.</strong> We advise users never to transmit sensitive diagnostic details in free-text inquiry fields. Prescription verification is conducted in-person by licensed pharmacists.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>5. Security Safeguards &amp; Data Retention</h2>
            <p>
              We implement industry-standard security safeguards including salted BCrypt password hashing, session tokens, prepared statements preventing SQL injection, and role-based access control. Inquiries and inventory audit records are retained for administrative traceability.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>6. Contact &amp; Governance Notice</h2>
            <p>
              For privacy inquiries, account deletion requests, or regulatory clarifications, contact our platform team at:
            </p>
            <div style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              marginTop: '10px',
              fontSize: '0.875rem',
            }}>
              <div><strong>Platform Administration:</strong> Medivolix Technical Operations</div>
              <div><strong>Email:</strong> privacy@medivolix.com (or designated operator address)</div>
              <div><strong>Status:</strong> Active demonstration release undergoing pre-launch regulatory review.</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
