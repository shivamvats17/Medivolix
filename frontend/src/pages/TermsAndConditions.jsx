import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="container" style={{ maxWidth: '840px', padding: '40px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <FileText size={28} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Terms and Conditions</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '32px' }}>
          Last Updated: October 2026 &bull; Medivolix Operating Agreement
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>1. Nature of the Service</h2>
            <p>
              Medivolix is an availability information discovery platform designed to assist patients in locating stock across participating physical pharmacies. <strong>Medivolix is not an online pharmacy, online chemist, drug manufacturer, or medical clinic.</strong> We do not sell, dispense, distribute, or deliver pharmaceutical products directly to patients.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>2. No Medical Advice or Diagnosis</h2>
            <p>
              Information presented on this platform (including medicine descriptions, dosage strengths, and categories) is provided strictly for identification and cataloging purposes. <strong>It does not constitute medical diagnosis, therapeutic recommendation, or prescription guidance.</strong> Always consult a certified healthcare professional regarding diagnoses, dosages, or drug substitutions.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>3. Stock Freshness &amp; Accuracy Disclaimers</h2>
            <p>
              Reported inventory quantities and availability states are recorded by participating pharmacies. Due to real-time physical walk-in sales, wholesale adjustments, and latency:
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Reported availability does not guarantee stock will be on hand upon physical arrival.</li>
              <li>Records not updated within 24 hours are labeled as <em>Outdated</em>.</li>
              <li>Users must contact the pharmacy by phone or wait for an in-app confirmation before traveling.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>4. Prescription Regulations</h2>
            <p>
              Prescription-only drugs (Schedule H, H1, or X in India) cannot be dispensed without a valid physical prescription issued by a registered medical practitioner. Participating pharmacies are strictly responsible for adhering to applicable Drugs and Cosmetics Acts and state licensing guidelines.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>5. User Responsibilities &amp; Acceptable Use</h2>
            <p>
              Users agree to provide accurate registration details, use availability inquiries solely for legitimate personal medical needs, and refrain from automated scraping, credential attacks, or submitting fraudulent reservation inquiries.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Medivolix and its operators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from stock discrepancies, store closures, travel expenses, or medicine unavailability at participating facilities.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
