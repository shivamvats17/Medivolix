import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { medicineService } from '../services/medicineService';
import { Search, MapPin, AlertCircle, Building2, X, Filter, Navigation, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import FreshnessBadge from '../components/common/FreshnessBadge';

export default function SearchMedicines() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // User Geolocation
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Filter option: 'ALL', 'AVAILABLE_ONLY', 'OTC', 'RX'
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    let ignore = false;
    async function runSearch() {
      setLoading(true);
      setError(null);
      try {
        const lat = userLocation?.lat || null;
        const lng = userLocation?.lng || null;
        const data = await medicineService.searchMedicines(initialQuery, lat, lng);
        if (!ignore) {
          setResults(data || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Error communicating with medicine catalog service');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    runSearch();
    return () => {
      ignore = true;
    };
  }, [initialQuery, userLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(query.trim() ? { q: query.trim() } : {});
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationLoading(false);
      },
      (_err) => {
        setLocationLoading(false);
        setLocationError('Location permission denied or unavailable. You can still search normally.');
      },
      { timeout: 10000 }
    );
  };

  // Filter results
  const filteredResults = results.filter((item) => {
    const med = item.medicine;
    if (filterType === 'AVAILABLE_ONLY') {
      return item.anyAvailable;
    }
    if (filterType === 'OTC') {
      return !med.prescriptionRequired;
    }
    if (filterType === 'RX') {
      return med.prescriptionRequired;
    }
    return true;
  });

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      {/* Search Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '8px' }}>
          Medicine Availability Search
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Discover which participating pharmacies have reported availability for required medications.
        </p>
      </div>

      {/* Search Bar & Geolocation Action */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by medicine name, brand name (e.g., Augmentin), or active composition..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '40px', paddingRight: query ? '36px' : '14px' }}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title="Clear search text"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Search size={16} /> Search
          </button>

          <button
            type="button"
            onClick={requestLocation}
            className={`btn ${userLocation ? 'btn-outline' : 'btn-secondary'}`}
            disabled={locationLoading}
            title="Calculate exact distance from pharmacies"
          >
            <Navigation size={16} />
            {locationLoading ? 'Detecting Location...' : userLocation ? 'Location Active' : 'Sort by Distance'}
          </button>
        </form>

        {locationError && (
          <div style={{ marginTop: '10px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Notice: {locationError}
          </div>
        )}

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Catalog' },
            { id: 'AVAILABLE_ONLY', label: 'Reported Available' },
            { id: 'OTC', label: 'Over-The-Counter (OTC)' },
            { id: 'RX', label: 'Prescription Required' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`btn btn-sm ${filterType === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8125rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Notice */}
      <div className="disclaimer-banner">
        <AlertCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          Stock levels are reported by participating pharmacies and may vary. Always contact or request confirmation before visiting in person.
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <LoadingSpinner message="Searching medicine catalog and checking pharmacy stock records..." />
      ) : error ? (
        <div className="alert alert-error" style={{ marginTop: '20px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', marginTop: '20px' }}>
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
            <Search size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
            No medicines matched your query
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            Try checking for spelling variations, searching by active generic ingredient (e.g. "Paracetamol"), or clear the current filter.
          </p>
          <button onClick={handleClear} className="btn btn-secondary">
            Reset Search Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing {filteredResults.length} medicine{filteredResults.length > 1 ? 's' : ''} with participating pharmacy availability:
          </div>

          {filteredResults.map((result) => {
            const med = result.medicine;
            const reportingPharmacies = result.availablePharmacies || [];

            return (
              <div key={med.id} className="card" style={{ padding: '24px' }}>
                {/* Medicine Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {med.name}
                      </h2>
                      {med.prescriptionRequired ? (
                        <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>
                          Prescription (Rx)
                        </span>
                      ) : (
                        <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                          OTC
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <strong>Brand:</strong> {med.brandName} &bull; <strong>Generic:</strong> {med.genericName} &bull; <strong>Strength:</strong> {med.strength} ({med.dosageForm})
                    </div>
                  </div>

                  <Link to={`/medicines/${med.id}`} className="btn btn-outline btn-sm">
                    View Details &amp; Request <ArrowRight size={14} />
                  </Link>
                </div>

                {med.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                    {med.description}
                  </p>
                )}

                {/* Participating Pharmacies List */}
                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '16px',
                }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                    Participating Pharmacies Reporting Stock ({reportingPharmacies.length}):
                  </div>

                  {reportingPharmacies.length === 0 ? (
                    <div style={{
                      backgroundColor: 'var(--bg-surface-secondary)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                    }}>
                      No participating pharmacies have reported current stock for this medicine.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {reportingPharmacies.map((inv) => (
                        <div
                          key={inv.id}
                          style={{
                            backgroundColor: 'var(--bg-surface-secondary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}
                        >
                          <div style={{ minWidth: '220px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Building2 size={16} style={{ color: 'var(--primary)' }} />
                              <Link
                                to={`/pharmacies/${inv.pharmacyId}`}
                                style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9375rem' }}
                              >
                                {inv.pharmacyName}
                              </Link>
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {inv.pharmacyAddress}, {inv.pharmacyCity}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            {inv.distanceKm !== null && inv.distanceKm !== undefined && (
                              <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={14} style={{ color: 'var(--primary)' }} />
                                <strong>{inv.distanceKm} km</strong> away
                              </div>
                            )}

                            <StatusBadge status={inv.stockStatus} />

                            <FreshnessBadge
                              lastUpdate={inv.lastStockUpdate}
                              isFresh={inv.isFresh}
                            />

                            <Link
                              to={`/medicines/${med.id}`}
                              className="btn btn-secondary btn-sm"
                            >
                              Check Stock
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
