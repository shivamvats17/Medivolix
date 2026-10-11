import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventoryService';
import { medicineService } from '../services/medicineService';
import {
  Building2, Plus, AlertTriangle, Calendar, ClipboardCheck, History,
  Search, CheckCircle2, RefreshCw, AlertCircle, Edit, Printer, FileSpreadsheet
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import FreshnessBadge from '../components/common/FreshnessBadge';
import Modal from '../components/common/Modal';
import {
  exportInventoryCsv,
  exportExpiringBatchesCsv,
  exportAuditLogsCsv,
  printBatchExpiryReport,
  printInquirySlip
} from '../utils/exportUtils';

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('INVENTORY');

  // Data states
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiringBatches, setExpiringBatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search filter inside inventory table
  const [inventorySearch, setInventorySearch] = useState('');

  // Add/Edit Medicine Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [lowStockThresh, setLowStockThresh] = useState('10');
  const [batchNum, setBatchNum] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Request Status Update Modal
  const [statusModalReq, setStatusModalReq] = useState(null);
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [pharmacyNotes, setPharmacyNotes] = useState('');

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchAllData() {
      try {
        const [invData, lowData, expData, reqData, auditData, catalogData] = await Promise.all([
          inventoryService.getInventory(),
          inventoryService.getLowStock(),
          inventoryService.getExpiringBatches(),
          inventoryService.getPharmacyRequests(),
          inventoryService.getAuditLogs(),
          medicineService.getAllMedicines(),
        ]);

        if (!ignore) {
          setInventory(invData || []);
          setLowStock(lowData || []);
          setExpiringBatches(expData || []);
          setRequests(reqData || []);
          setAuditLogs(auditData || []);
          setAllMedicines(catalogData || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load pharmacy dashboard data');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchAllData();
    return () => {
      ignore = true;
    };
  }, [refreshTrigger]);

  const reloadAllData = () => {
    setLoading(true);
    setError(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSaveInventory = async (e) => {
    e.preventDefault();
    if (!selectedMedId) return;

    setModalSubmitting(true);
    try {
      await inventoryService.saveInventoryItem({
        medicineId: parseInt(selectedMedId, 10),
        stockQuantity: parseInt(stockQty, 10) || 0,
        price: parseFloat(unitPrice) || 0,
        lowStockThreshold: parseInt(lowStockThresh, 10) || 10,
        batchNumber: batchNum.trim() || undefined,
        expiryDate: expiryDate || undefined,
      });

      setSuccessMessage('Inventory record updated successfully.');
      setAddModalOpen(false);
      resetAddForm();
      reloadAllData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save inventory item');
    } finally {
      setModalSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setSelectedMedId('');
    setStockQty('');
    setUnitPrice('');
    setLowStockThresh('10');
    setBatchNum('');
    setExpiryDate('');
  };

  const handleMarkUnavailable = async (invId) => {
    if (!window.confirm('Mark this medicine as currently unavailable?')) return;
    try {
      await inventoryService.markUnavailable(invId);
      setSuccessMessage('Medicine marked as unavailable.');
      reloadAllData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update item');
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalReq) return;

    try {
      await inventoryService.updateRequestStatus(statusModalReq.id, newStatus, pharmacyNotes.trim());
      setSuccessMessage(`Inquiry #${statusModalReq.id} marked as ${newStatus}.`);
      setStatusModalReq(null);
      setPharmacyNotes('');
      reloadAllData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update inquiry status');
    }
  };

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    if (!inventorySearch.trim()) return true;
    const term = inventorySearch.toLowerCase();
    return (
      item.medicineName?.toLowerCase().includes(term) ||
      item.brandName?.toLowerCase().includes(term) ||
      item.genericName?.toLowerCase().includes(term)
    );
  });

  if (loading && inventory.length === 0) {
    return <LoadingSpinner message="Loading pharmacy dashboard..." />;
  }

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      {/* Pharmacy Header Banner */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={24} style={{ color: 'var(--primary)' }} />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {user?.pharmacyName || 'Pharmacy Management Portal'}
              </h1>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Logged in as Pharmacy Administrator: <strong>{user?.fullName}</strong> ({user?.email})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { resetAddForm(); setAddModalOpen(true); }}
              className="btn btn-primary"
            >
              <Plus size={16} /> Add / Update Stock
            </button>
            <button onClick={reloadAllData} className="btn btn-secondary" title="Refresh dashboard data">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Quick Operational Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Medicines</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-main)' }}>{inventory.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Low-Stock Flags</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: lowStock.length > 0 ? '#ea580c' : 'var(--text-main)' }}>
              {lowStock.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Approaching Expiry (&le;45d)</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: expiringBatches.length > 0 ? '#dc2626' : 'var(--text-main)' }}>
              {expiringBatches.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Patient Inquiries</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--primary)' }}>
              {requests.filter(r => r.status === 'PENDING').length} Pending
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={16} /> {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '20px',
        overflowX: 'auto',
      }}>
        {[
          { id: 'INVENTORY', label: `Inventory Catalog (${inventory.length})`, icon: Building2 },
          { id: 'LOW_STOCK', label: `Low Stock Alerts (${lowStock.length})`, icon: AlertTriangle },
          { id: 'EXPIRY', label: `Expiry Tracking (${expiringBatches.length})`, icon: Calendar },
          { id: 'REQUESTS', label: `Patient Inquiries (${requests.length})`, icon: ClipboardCheck },
          { id: 'AUDIT', label: 'Audit Trail', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 'none',
                borderBottom: active ? '3px solid var(--primary)' : '3px solid transparent',
                backgroundColor: 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Current Inventory */}
      {activeTab === 'INVENTORY' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search store inventory..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => exportInventoryCsv(filteredInventory, user?.pharmacyName)}
                className="btn btn-secondary btn-sm"
                title="Download inventory list as CSV spreadsheet"
                disabled={filteredInventory.length === 0}
              >
                <FileSpreadsheet size={15} /> Export CSV
              </button>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Showing {filteredInventory.length} medicines
              </div>
            </div>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No inventory items found.</p>
              <button onClick={() => { resetAddForm(); setAddModalOpen(true); }} className="btn btn-primary btn-sm">
                <Plus size={14} /> Add First Medicine
              </button>
            </div>
          ) : (
            <div className="table-responsive card" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Composition / Dosage</th>
                    <th>Stock Quantity</th>
                    <th>Unit Price</th>
                    <th>Status</th>
                    <th>Last Stock Update</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{item.medicineName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Brand: {item.brandName}
                        </div>
                      </td>
                      <td>
                        {item.genericName}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.strength} ({item.dosageForm})
                        </div>
                      </td>
                      <td>
                        <strong>{item.stockQuantity}</strong> units
                        {item.stockQuantity <= item.lowStockThreshold && (
                          <div style={{ fontSize: '0.6875rem', color: '#ea580c', fontWeight: 600 }}>Low Stock Alert</div>
                        )}
                      </td>
                      <td>
                        {item.price ? `₹${parseFloat(item.price).toFixed(2)}` : '—'}
                      </td>
                      <td>
                        <StatusBadge status={item.stockQuantity > 0 && item.isAvailable ? (item.stockQuantity <= item.lowStockThreshold ? 'LOW_STOCK' : 'AVAILABLE') : 'UNAVAILABLE'} />
                      </td>
                      <td>
                        <FreshnessBadge lastUpdate={item.lastStockUpdate} isFresh={true} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setSelectedMedId(String(item.medicineId));
                              setStockQty(String(item.stockQuantity));
                              setUnitPrice(String(item.price));
                              setLowStockThresh(String(item.lowStockThreshold));
                              setAddModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            title="Edit stock or price"
                          >
                            <Edit size={13} /> Edit
                          </button>
                          {item.isAvailable && item.stockQuantity > 0 && (
                            <button
                              onClick={() => handleMarkUnavailable(item.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#dc2626' }}
                              title="Mark temporarily unavailable"
                            >
                              Unavailable
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Low Stock Alerts */}
      {activeTab === 'LOW_STOCK' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Medicines where reported stock is at or below the designated reorder threshold.
            </div>
            {lowStock.length > 0 && (
              <button
                type="button"
                onClick={() => exportInventoryCsv(lowStock, `${user?.pharmacyName || 'pharmacy'}_low_stock`)}
                className="btn btn-secondary btn-sm"
              >
                <FileSpreadsheet size={15} /> Export Low-Stock CSV
              </button>
            )}
          </div>
          {lowStock.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
              <CheckCircle2 size={36} style={{ color: '#059669', margin: '0 auto 8px auto' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>All inventory stock levels are healthy.</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No items are currently below their low-stock threshold.</p>
            </div>
          ) : (
            <div className="table-responsive card" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Current Units</th>
                    <th>Threshold</th>
                    <th>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.medicineName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.strength}</div>
                      </td>
                      <td style={{ color: '#ea580c', fontWeight: 700 }}>
                        {item.stockQuantity} units
                      </td>
                      <td>{item.lowStockThreshold} units</td>
                      <td>₹{parseFloat(item.price).toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setSelectedMedId(String(item.medicineId));
                            setStockQty(String(item.stockQuantity));
                            setUnitPrice(String(item.price));
                            setLowStockThresh(String(item.lowStockThreshold));
                            setAddModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          Restock Quantity
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Expiry Tracking */}
      {activeTab === 'EXPIRY' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Batch-level monitoring flags stock batches expiring within 45 days. Expired stock is automatically quarantined from publicly reported availability.
            </div>
            {expiringBatches.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => exportExpiringBatchesCsv(expiringBatches, user?.pharmacyName)}
                  className="btn btn-secondary btn-sm"
                  title="Download expiring batches as CSV spreadsheet"
                >
                  <FileSpreadsheet size={15} /> Export Batches CSV
                </button>
                <button
                  type="button"
                  onClick={() => printBatchExpiryReport({ name: user?.pharmacyName }, expiringBatches)}
                  className="btn btn-primary btn-sm"
                  title="Generate official printable Batch Expiry Audit Report"
                >
                  <Printer size={15} /> Print Audit Report (PDF)
                </button>
              </div>
            )}
          </div>
          {expiringBatches.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
              <CheckCircle2 size={36} style={{ color: '#059669', margin: '0 auto 8px auto' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No batches approaching expiry.</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>All tracked batches have more than 45 days of validity remaining.</p>
            </div>
          ) : (
            <div className="table-responsive card" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Batch Number</th>
                    <th>Batch Quantity</th>
                    <th>Expiry Date</th>
                    <th>Days Remaining</th>
                    <th>Batch Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringBatches.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.medicineName}</strong></td>
                      <td><code>{b.batchNumber}</code></td>
                      <td>{b.quantity} units</td>
                      <td>{b.expiryDate}</td>
                      <td>
                        <span style={{
                          color: b.daysUntilExpiry <= 30 ? '#dc2626' : '#ea580c',
                          fontWeight: 700,
                        }}>
                          {b.daysUntilExpiry} days
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-low">{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Customer Inquiries */}
      {activeTab === 'REQUESTS' && (
        <div>
          <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            In-app medicine availability inquiries submitted by patients. Confirm stock or leave notes to assist patients before they arrive.
          </div>
          {requests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No patient availability inquiries have been received yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {requests.map((r) => (
                <div key={r.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          INQUIRY #{r.id}
                        </span>
                        <StatusBadge status={r.status} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '4px' }}>
                        {r.medicineName} &bull; Requested: {r.requestedQuantity} unit(s)
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Patient: <strong>{r.customerName}</strong> &bull; Phone: <a href={`tel:${r.customerPhone}`}>{r.customerPhone}</a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => printInquirySlip(r, { name: user?.pharmacyName })}
                        className="btn btn-secondary btn-sm"
                        title="Print patient confirmation / counter pickup slip"
                      >
                        <Printer size={14} /> Print Slip
                      </button>
                      <button
                        onClick={() => {
                          setStatusModalReq(r);
                          setNewStatus(r.status === 'PENDING' ? 'CONFIRMED' : r.status);
                          setPharmacyNotes(r.pharmacyNotes || '');
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        Update Response / Status
                      </button>
                    </div>
                  </div>

                  {r.customerNotes && (
                    <div style={{
                      backgroundColor: 'var(--bg-surface-secondary)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      marginTop: '12px',
                    }}>
                      <strong>Patient Note:</strong> {r.customerNotes}
                    </div>
                  )}

                  {r.pharmacyNotes && (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#166534',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      marginTop: '10px',
                    }}>
                      <strong>Your Pharmacy Response:</strong> {r.pharmacyNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Audit Log */}
      {activeTab === 'AUDIT' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Immutable audit log capturing all stock quantity changes, reorder updates, and availability modifications for regulatory compliance.
            </div>
            {auditLogs.length > 0 && (
              <button
                type="button"
                onClick={() => exportAuditLogsCsv(auditLogs, user?.pharmacyName)}
                className="btn btn-secondary btn-sm"
                title="Download immutable audit trail as CSV spreadsheet"
              >
                <FileSpreadsheet size={15} /> Export Audit Log CSV
              </button>
            )}
          </div>
          {auditLogs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No audit events logged yet.</p>
            </div>
          ) : (
            <div className="table-responsive card" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Medicine</th>
                    <th>Change</th>
                    <th>New Total</th>
                    <th>Details</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                      </td>
                      <td><code>{log.action}</code></td>
                      <td><strong>{log.medicineName}</strong></td>
                      <td style={{ color: log.quantityChange > 0 ? '#166534' : (log.quantityChange < 0 ? '#dc2626' : 'var(--text-main)') }}>
                        {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                      </td>
                      <td>{log.newQuantity} units</td>
                      <td style={{ fontSize: '0.8125rem' }}>{log.details}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{log.userName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Update Stock Modal */}
      {addModalOpen && (
        <Modal
          isOpen={addModalOpen}
          title="Add / Update Medicine Stock"
          onClose={() => setAddModalOpen(false)}
        >
          <form onSubmit={handleSaveInventory}>
            <div className="form-group">
              <label className="form-label">Select Medicine from Standard Catalog</label>
              <select
                className="form-select"
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                required
              >
                <option value="">-- Choose Medicine --</option>
                {allMedicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.brandName}) &bull; {m.strength}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Stock Quantity (Units)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="e.g. 50"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price per Unit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  placeholder="e.g. 45.00"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Low Stock Warning Threshold</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={lowStockThresh}
                onChange={(e) => setLowStockThresh(e.target.value)}
              />
              <span className="form-hint">Flags an alert when stock reaches this amount or lower.</span>
            </div>

            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '14px',
              marginTop: '14px',
            }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px' }}>
                Batch Tracking (Optional)
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Batch / Lot Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. BATCH-2024-X"
                    value={batchNum}
                    onChange={(e) => setBatchNum(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Batch Expiry Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="btn btn-secondary"
                disabled={modalSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={modalSubmitting}
              >
                {modalSubmitting ? 'Saving...' : 'Save Stock Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Response / Status Modal */}
      {statusModalReq && (
        <Modal
          isOpen={!!statusModalReq}
          title={`Update Status for Inquiry #${statusModalReq.id}`}
          onClose={() => setStatusModalReq(null)}
        >
          <form onSubmit={handleUpdateStatusSubmit}>
            <div style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontSize: '0.875rem',
            }}>
              <div><strong>Medicine:</strong> {statusModalReq.medicineName}</div>
              <div><strong>Requested Quantity:</strong> {statusModalReq.requestedQuantity} units</div>
              <div><strong>Patient:</strong> {statusModalReq.customerName} ({statusModalReq.customerPhone})</div>
            </div>

            <div className="form-group">
              <label className="form-label">Set New Availability Status</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                <option value="CONFIRMED">CONFIRMED (Stock verified &amp; available)</option>
                <option value="UNAVAILABLE">UNAVAILABLE (Currently out of stock)</option>
                <option value="COMPLETED">COMPLETED (Collected by patient)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Response Note to Patient</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="e.g. Stock verified. Held aside for 2 hours. Please present prescription upon arrival."
                value={pharmacyNotes}
                onChange={(e) => setPharmacyNotes(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
              <button
                type="button"
                onClick={() => setStatusModalReq(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Inquiry Status
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
