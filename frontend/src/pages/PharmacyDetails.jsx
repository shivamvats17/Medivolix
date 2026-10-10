import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pharmacyService } from '../services/pharmacyService';
import { Phone, Mail, MapPin, Clock, ShieldCheck, ArrowLeft, AlertCircle, Search } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import FreshnessBadge from '../components/common/FreshnessBadge';

export default function PharmacyDetails() {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [pharmData, medData] = await Promise.all([
          pharmacyService.getPharmacyById(id),
          pharmacyService.getPharmacyMedicines(id),
        ]);
        setPharmacy(pharmData);
        setMedicines(medData || []);
      } catch (err) {
        setError(err.message || 'Failed to load pharmacy details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 16px' }}>
        <LoadingSpinner message="Loading pharmacy profile and inventory catalog..." />
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="container" style={{ padding: '48px 16px' }}>
        <div className="alert alert-error">
          <AlertCircle size={18} /> {error || 'Pharmacy record not found'}
        </div>
        <Link to="/search" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Search
        </Link>
      </div>
    );
  }

  const filteredMedicines = medicines.filter((item) => {
    if (!filterQuery.trim()) return true;
    const term = filterQuery.toLowerCase();
    return (
      item.medicineName?.toLowerCase().includes(term) ||
      item.brandName?.toLowerCase().includes(term) ||
      item.genericName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Search
        </Link>
      </div>

      {/* Pharmacy Header Card */}
      <div className="card" style={{ marginBottom: '28px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {pharmacy.name}
              </h1>
              <span className="badge badge-available">
                <ShieldCheck size={14} /> Verified Licensed Pharmacy
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              State Drug License: <strong>{pharmacy.licenseNumber}</strong>
            </div>
          </div>

          <a href={`tel:${pharmacy.phone}`} className="btn btn-primary">
            <Phone size={16} /> Call Pharmacy
          </a>
        </div>

        {/* Pharmacy Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          backgroundColor: 'var(--bg-surface-secondary)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} /> Physical Address
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px', fontSize: '0.9375rem' }}>
              {pharmacy.addressLine1}
              {pharmacy.addressLine2 && <div>{pharmacy.addressLine2}</div>}
              <div>{pharmacy.city}, {pharmacy.state} - {pharmacy.postalCode}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={13} /> Telephone
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px', fontSize: '0.9375rem' }}>
              <a href={`tel:${pharmacy.phone}`}>{pharmacy.phone}</a>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={13} /> Email Contact
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px', fontSize: '0.9375rem' }}>
              <a href={`mailto:${pharmacy.email}`}>{pharmacy.email}</a>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> Operating Hours
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px', fontSize: '0.9375rem' }}>
              {pharmacy.operatingHours || '9:00 AM - 9:00 PM'}
            </div>
          </div>
        </div>
      </div>

      {/* Transparency Disclaimer */}
      <div className="disclaimer-banner">
        <AlertCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          Reported inventory is submitted periodically by this pharmacy. Please call the pharmacy prior to departure to ensure prescription verification and hold requests.
        </div>
      </div>

      {/* Pharmacy Inventory Listing */}
      <div style={{ marginTop: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            Reported Medicine Inventory ({medicines.length})
          </h2>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Filter store catalog..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {filteredMedicines.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              No medications matched your filter in this pharmacy's reported catalog.
            </p>
          </div>
        ) : (
          <div className="table-responsive card" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Medicine &amp; Generic Form</th>
                  <th>Strength</th>
                  <th>Status</th>
                  <th>Unit Price</th>
                  <th>Last Update</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/medicines/${item.medicineId}`} style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.medicineName}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Brand: {item.brandName} &bull; Generic: {item.genericName}
                      </div>
                    </td>
                    <td>{item.strength} ({item.dosageForm})</td>
                    <td>
                      <StatusBadge status={item.stockQuantity > 0 ? (item.stockQuantity <= 10 ? 'LOW_STOCK' : 'AVAILABLE') : 'UNAVAILABLE'} />
                    </td>
                    <td>
                      {item.price ? `₹${parseFloat(item.price).toFixed(2)}` : '—'}
                    </td>
                    <td>
                      <FreshnessBadge lastUpdate={item.lastStockUpdate} isFresh={true} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/medicines/${item.medicineId}`} className="btn btn-outline btn-sm">
                        Details &amp; Request
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
