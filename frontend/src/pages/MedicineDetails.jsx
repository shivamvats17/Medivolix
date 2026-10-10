import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { medicineService } from '../services/medicineService';
import { requestService } from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import { Building2, Phone, MapPin, AlertCircle, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import FreshnessBadge from '../components/common/FreshnessBadge';
import Modal from '../components/common/Modal';

export default function MedicineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Request Modal State
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [requestQty, setRequestQty] = useState(1);
  const [customerNotes, setCustomerNotes] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(null);
  const [requestError, setRequestError] = useState(null);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      setError(null);
      try {
        const result = await medicineService.getMedicineById(id);
        setData(result);
      } catch (err) {
        setError(err.message || 'Failed to load medicine details');
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [id]);

  const handleOpenRequestModal = (pharmacyInv) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: `/medicines/${id}` } });
      return;
    }
    setSelectedPharmacy(pharmacyInv);
    setRequestQty(1);
    setCustomerNotes('');
    setRequestSuccess(null);
    setRequestError(null);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedPharmacy) return;

    setSubmittingRequest(true);
    setRequestError(null);
    try {
      await requestService.createRequest({
        pharmacyId: selectedPharmacy.pharmacyId,
        medicineId: parseInt(id, 10),
        requestedQuantity: parseInt(requestQty, 10) || 1,
        customerNotes: customerNotes.trim(),
      });
      setRequestSuccess('Availability inquiry submitted successfully! The pharmacy will review and respond.');
      setTimeout(() => {
        setSelectedPharmacy(null);
      }, 2500);
    } catch (err) {
      setRequestError(err.message || 'Failed to submit availability request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 16px' }}>
        <LoadingSpinner message="Loading medicine specifications and live pharmacy availability..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ padding: '48px 16px' }}>
        <div className="alert alert-error">
          <AlertCircle size={18} /> {error || 'Medicine record not found'}
        </div>
        <Link to="/search" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Search
        </Link>
      </div>
    );
  }

  const med = data.medicine;
  const pharmacies = data.availablePharmacies || [];

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Search Results
        </Link>
      </div>

      {/* Medicine Overview Card */}
      <div className="card" style={{ marginBottom: '28px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {med.name}
              </h1>
              {med.prescriptionRequired ? (
                <span className="badge badge-low">Prescription Required (Rx)</span>
              ) : (
                <span className="badge badge-info">Over-The-Counter (OTC)</span>
              )}
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Brand: <strong style={{ color: 'var(--text-main)' }}>{med.brandName}</strong> &bull; Generic: <strong style={{ color: 'var(--text-main)' }}>{med.genericName}</strong>
            </div>
          </div>
        </div>

        {/* Medicine Properties Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          backgroundColor: 'var(--bg-surface-secondary)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Strength / Dosage</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{med.strength}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Dosage Form</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{med.dosageForm}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Category</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{med.category || 'General Therapeutic'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Manufacturer</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{med.manufacturer || 'Approved Supplier'}</div>
          </div>
        </div>

        {med.description && (
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '6px' }}>Indications &amp; Overview</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {med.description}
            </p>
          </div>
        )}
      </div>

      {/* Transparency Disclaimer Notice */}
      <div className="disclaimer-banner">
        <AlertCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Important Clinical &amp; Inventory Notice:</strong> Stock levels are reported by participating pharmacies and may change. Medivolix is an availability information platform and does not dispense medications. Contact the pharmacy directly or submit an in-app inquiry to confirm current stock before visiting.
        </div>
      </div>

      {/* Participating Pharmacies Section */}
      <div style={{ marginTop: '28px' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '16px' }}>
          Participating Pharmacies Reporting Stock ({pharmacies.length})
        </h2>

        {pharmacies.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              No participating pharmacies currently report stock for this medication.
            </p>
            <Link to="/search" className="btn btn-secondary">
              Search Other Medications
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pharmacies.map((inv) => (
              <div key={inv.id} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={20} style={{ color: 'var(--primary)' }} />
                      <Link to={`/pharmacies/${inv.pharmacyId}`} style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {inv.pharmacyName}
                      </Link>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} style={{ color: 'var(--text-muted)' }} />
                      {inv.pharmacyAddress}, {inv.pharmacyCity}
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={15} style={{ color: 'var(--text-muted)' }} />
                      <a href={`tel:${inv.pharmacyPhone}`} style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                        {inv.pharmacyPhone}
                      </a>
                    </div>
                  </div>

                  {/* Stock State & Price */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <StatusBadge status={inv.stockStatus} />
                      <FreshnessBadge lastUpdate={inv.lastStockUpdate} isFresh={inv.isFresh} />
                    </div>

                    {inv.price && (
                      <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{parseFloat(inv.price).toFixed(2)}
                        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}> / unit</span>
                      </div>
                    )}

                    {inv.distanceKm !== null && inv.distanceKm !== undefined && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Proximity: <strong>{inv.distanceKm} km</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                  marginTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Reported Quantity: <strong>{inv.stockQuantity} units</strong> &bull; Requires pharmacy confirmation
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a
                      href={`tel:${inv.pharmacyPhone}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <Phone size={14} /> Call Pharmacy
                    </a>
                    <button
                      type="button"
                      onClick={() => handleOpenRequestModal(inv)}
                      className="btn btn-primary btn-sm"
                      disabled={inv.stockStatus === 'UNAVAILABLE'}
                    >
                      <Send size={14} /> Request Availability Confirmation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inquiry Submission Modal */}
      {selectedPharmacy && (
        <Modal
          isOpen={!!selectedPharmacy}
          title="Request Availability Confirmation"
          onClose={() => setSelectedPharmacy(null)}
        >
          {requestSuccess ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle2 size={44} style={{ color: '#059669', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Inquiry Sent!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {requestSuccess}
              </p>
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                View My Inquiries
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest}>
              <div style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                fontSize: '0.875rem',
              }}>
                <div><strong>Medicine:</strong> {med.name} ({med.strength})</div>
                <div style={{ marginTop: '4px' }}><strong>Pharmacy:</strong> {selectedPharmacy.pharmacyName}</div>
              </div>

              {requestError && (
                <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} /> {requestError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Required Quantity (Units / Strips)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-control"
                  value={requestQty}
                  onChange={(e) => setRequestQty(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Optional Patient Note / Timing</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g., Doctor prescribed for urgent start today. Can collect within 2 hours. Have valid prescription."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />
                <span className="form-hint">
                  Do not transmit confidential diagnostic data. The pharmacy will respond directly within your Medivolix account.
                </span>
              </div>

              <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedPharmacy(null)}
                  className="btn btn-secondary"
                  disabled={submittingRequest}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingRequest}
                >
                  {submittingRequest ? 'Submitting...' : 'Send Confirmation Request'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
