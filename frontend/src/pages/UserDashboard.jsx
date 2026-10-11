import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/requestService';
import { ClipboardList, Building2, Phone, Search, AlertCircle, RefreshCw, XCircle, CheckCircle2, Printer } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { printInquirySlip } from '../utils/exportUtils';

export default function UserDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchRequests() {
      try {
        const data = await requestService.getMyRequests();
        if (!ignore) {
          setRequests(data || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load availability inquiries');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchRequests();
    return () => {
      ignore = true;
    };
  }, [refreshTrigger]);

  const reloadRequests = () => {
    setLoading(true);
    setError(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this availability inquiry?')) {
      return;
    }
    try {
      await requestService.cancelRequest(requestId);
      setActionMessage('Inquiry cancelled successfully.');
      reloadRequests();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Could not cancel inquiry');
    }
  };

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      {/* Header Profile Banner */}
      <div className="card" style={{ marginBottom: '28px', padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              Welcome, {user?.fullName || 'Customer'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Track medicine availability confirmation requests sent to participating pharmacies.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/search" className="btn btn-primary btn-sm">
              <Search size={15} /> Search Medicines
            </Link>
            <button onClick={reloadRequests} className="btn btn-secondary btn-sm" title="Refresh list">
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={16} /> {actionMessage}
        </div>
      )}

      {/* Inquiries Section */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={20} style={{ color: 'var(--primary)' }} />
          My Availability Inquiries ({requests.length})
        </h2>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your submitted inquiries..." />
      ) : error ? (
        <div className="alert alert-error">
          <AlertCircle size={18} /> {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: 'var(--text-muted)',
          }}>
            <ClipboardList size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
            No availability inquiries submitted yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            When you find a required medicine, you can request stock confirmation from participating pharmacies directly before travelling.
          </p>
          <Link to="/search" className="btn btn-primary">
            <Search size={16} /> Search Medicines Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((req) => (
            <div key={req.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      INQUIRY #{req.id}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>

                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '4px' }}>
                    {req.medicineName} {req.strength && `(${req.strength})`}
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Requested Quantity: <strong>{req.requestedQuantity} unit(s)</strong>
                  </div>
                </div>

                {/* Pharmacy Contact Cardlet */}
                <div style={{
                  backgroundColor: 'var(--bg-surface-secondary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Building2 size={13} style={{ color: 'var(--primary)' }} /> {req.pharmacyName}
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                    {req.pharmacyAddress}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <a href={`tel:${req.pharmacyPhone}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      <Phone size={11} style={{ display: 'inline', marginRight: '3px' }} /> {req.pharmacyPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Notes & Responses */}
              {(req.customerNotes || req.pharmacyNotes) && (
                <div style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.8125rem',
                }}>
                  {req.customerNotes && (
                    <div>
                      <strong style={{ color: 'var(--text-muted)' }}>Your Note:</strong> {req.customerNotes}
                    </div>
                  )}
                  {req.pharmacyNotes && (
                    <div style={{
                      backgroundColor: req.status === 'CONFIRMED' ? '#f0fdf4' : '#f8fafc',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: req.status === 'CONFIRMED' ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                      color: req.status === 'CONFIRMED' ? '#166534' : 'var(--text-main)',
                    }}>
                      <strong>Pharmacy Response:</strong> {req.pharmacyNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Footer with Timestamp and Action */}
              <div style={{
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}>
                <div>
                  Submitted: {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'Recently'}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => printInquirySlip(req)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Print or Save confirmation slip as PDF"
                  >
                    <Printer size={13} /> Print Slip (PDF)
                  </button>
                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelRequest(req.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', color: '#dc2626' }}
                    >
                      <XCircle size={13} /> Cancel Inquiry
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
