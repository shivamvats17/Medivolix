import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import {
  ShieldCheck, Building2, Users, FileText, CheckCircle2,
  XCircle, AlertCircle, RefreshCw, AlertTriangle, Layers
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('PHARMACIES');

  const [overview, setOverview] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stats, pharms, users] = await Promise.all([
        adminService.getOverview(),
        adminService.getPharmacies(),
        adminService.getUsers(),
      ]);
      setOverview(stats);
      setPharmacies(pharms || []);
      setUsersList(users || []);
    } catch (err) {
      setError(err.message || 'Failed to load administrator data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePharmacy = async (pharmacyId) => {
    if (!window.confirm('Approve this pharmacy for public availability listings?')) return;
    try {
      await adminService.approvePharmacy(pharmacyId);
      setActionSuccess('Pharmacy approved successfully.');
      loadAdminData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleSuspendPharmacy = async (pharmacyId) => {
    if (!window.confirm('Suspend this pharmacy? Its reported inventory will be removed from public search.')) return;
    try {
      await adminService.suspendPharmacy(pharmacyId);
      setActionSuccess('Pharmacy suspended.');
      loadAdminData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert(err.message || 'Suspension failed');
    }
  };

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      {/* Admin Header */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={26} style={{ color: '#dc2626' }} />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                System Administration
              </h1>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Logged in as System Administrator: <strong>{user?.fullName}</strong> ({user?.email})
            </div>
          </div>

          <button onClick={loadAdminData} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh Metrics
          </button>
        </div>

        {/* Real Operational Metrics Cards */}
        {overview && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div className="card" style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Registered Users</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {overview.totalUsers}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {overview.totalCustomers} Customers
              </div>
            </div>

            <div className="card" style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Pharmacies</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {overview.totalPharmacies}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {overview.approvedPharmacies} Active &bull; {overview.pendingPharmacies} Pending
              </div>
            </div>

            <div className="card" style={{ padding: '16px', backgroundColor: overview.pendingPharmacies > 0 ? '#fef3c7' : 'var(--bg-surface-secondary)' }}>
              <div style={{ fontSize: '0.75rem', color: overview.pendingPharmacies > 0 ? '#92400e' : 'var(--text-muted)', fontWeight: 600 }}>
                Pending Verification
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: overview.pendingPharmacies > 0 ? '#b45309' : 'var(--text-main)', marginTop: '4px' }}>
                {overview.pendingPharmacies}
              </div>
              <div style={{ fontSize: '0.6875rem', color: overview.pendingPharmacies > 0 ? '#92400e' : 'var(--text-muted)' }}>
                Require credential review
              </div>
            </div>

            <div className="card" style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Catalog Medicines</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {overview.totalMedicines}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {overview.totalInventoryItems} Reported Stock Items
              </div>
            </div>

            <div className="card" style={{ padding: '16px', backgroundColor: 'var(--bg-surface-secondary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Patient Inquiries</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                {overview.totalRequests}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {overview.pendingRequests} Active Pending
              </div>
            </div>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '20px',
      }}>
        <button
          onClick={() => setActiveTab('PHARMACIES')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            border: 'none',
            borderBottom: activeTab === 'PHARMACIES' ? '3px solid var(--primary)' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'PHARMACIES' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'PHARMACIES' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          <Building2 size={16} /> Participating Pharmacies ({pharmacies.length})
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            border: 'none',
            borderBottom: activeTab === 'USERS' ? '3px solid var(--primary)' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'USERS' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'USERS' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          <Users size={16} /> Registered Users ({usersList.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading administrative records..." />
      ) : activeTab === 'PHARMACIES' ? (
        <div className="table-responsive card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Pharmacy Name</th>
                <th>License Number</th>
                <th>City &amp; Postal</th>
                <th>Phone</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Governance Actions</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email}</div>
                  </td>
                  <td><code>{p.licenseNumber}</code></td>
                  <td>{p.city}, {p.postalCode}</td>
                  <td>{p.phone}</td>
                  <td>
                    <span className={`badge ${
                      p.status === 'APPROVED' ? 'badge-available' : (p.status === 'PENDING' ? 'badge-low' : 'badge-out')
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {p.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleApprovePharmacy(p.id)}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle2 size={13} /> Approve
                        </button>
                      )}
                      {p.status === 'APPROVED' && (
                        <button
                          onClick={() => handleSuspendPharmacy(p.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#dc2626' }}
                        >
                          <XCircle size={13} /> Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.fullName}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>
                    <span className={`badge ${
                      u.role === 'SYSTEM_ADMIN' ? 'badge-out' : (u.role === 'PHARMACY_ADMIN' ? 'badge-info' : 'badge-available')
                    }`}>
                      {u.role}
                    </span>
                    {u.pharmacyName && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {u.pharmacyName}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'ACTIVE' ? 'badge-available' : 'badge-out'}`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
