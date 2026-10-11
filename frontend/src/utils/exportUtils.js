/**
 * Medivolix Export & Print Utilities
 * Generates RFC 4180 compliant CSV exports and clinical printable slips/PDF reports.
 */

/**
 * Escapes and formats a field for RFC 4180 CSV compliance.
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Downloads data as a CSV file with UTF-8 BOM for Microsoft Excel compatibility.
 */
export function exportToCsv(filename, headers, rows) {
  const headerLine = headers.map(escapeCsvValue).join(',');
  const rowLines = rows.map((row) => row.map(escapeCsvValue).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports current pharmacy inventory catalog to CSV.
 */
export function exportInventoryCsv(inventory, pharmacyName = 'Pharmacy') {
  const safeName = pharmacyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `medivolix_inventory_${safeName}_${dateStr}.csv`;

  const headers = [
    'Medicine ID',
    'Brand Name',
    'Generic Composition',
    'Dosage Form',
    'Strength',
    'Category',
    'Stock Quantity',
    'Unit Price (INR)',
    'Low Stock Threshold',
    'Availability Status',
    'Last Reported Update'
  ];

  const rows = inventory.map((item) => [
    item.medicineId || item.id || '',
    item.medicineName || item.brandName || '',
    item.genericName || '',
    item.dosageForm || '',
    item.strength || '',
    item.category || '',
    item.stockQuantity !== undefined ? item.stockQuantity : '',
    item.price !== undefined ? Number(item.price).toFixed(2) : '',
    item.lowStockThreshold || 10,
    item.stockStatus || (item.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'),
    item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : ''
  ]);

  exportToCsv(filename, headers, rows);
}

/**
 * Exports expiring batches list to CSV.
 */
export function exportExpiringBatchesCsv(batches, pharmacyName = 'Pharmacy') {
  const safeName = pharmacyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `medivolix_expiring_batches_${safeName}_${dateStr}.csv`;

  const headers = [
    'Batch Record ID',
    'Medicine Name',
    'Batch Number',
    'Quantity (Units)',
    'Expiry Date',
    'Days Remaining',
    'Risk Category'
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = batches.map((b) => {
    const exp = new Date(b.expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    let risk = 'STABLE';
    if (diffDays <= 0) risk = 'EXPIRED (QUARANTINE)';
    else if (diffDays <= 15) risk = 'CRITICAL (<15 Days)';
    else if (diffDays <= 45) risk = 'WARNING (<45 Days)';

    return [
      b.id || '',
      b.medicineName || 'N/A',
      b.batchNumber || '',
      b.quantity || '',
      b.expiryDate || '',
      diffDays > 0 ? `${diffDays} days` : 'Expired',
      risk
    ];
  });

  exportToCsv(filename, headers, rows);
}

/**
 * Exports inventory audit log trail to CSV.
 */
export function exportAuditLogsCsv(logs, pharmacyName = 'Pharmacy') {
  const safeName = pharmacyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `medivolix_audit_trail_${safeName}_${dateStr}.csv`;

  const headers = [
    'Audit ID',
    'Timestamp',
    'Inventory ID',
    'Medicine Name',
    'Previous Quantity',
    'New Quantity',
    'Delta',
    'Adjustment Reason',
    'Changed By User ID'
  ];

  const rows = logs.map((log) => {
    const delta = (log.newQuantity !== undefined && log.oldQuantity !== undefined)
      ? (log.newQuantity - log.oldQuantity)
      : '';
    const deltaStr = delta > 0 ? `+${delta}` : String(delta);

    return [
      log.id || '',
      log.createdAt ? new Date(log.createdAt).toLocaleString() : '',
      log.inventoryId || '',
      log.medicineName || '',
      log.oldQuantity !== undefined ? log.oldQuantity : '',
      log.newQuantity !== undefined ? log.newQuantity : '',
      deltaStr,
      log.changeReason || '',
      log.changedBy || ''
    ];
  });

  exportToCsv(filename, headers, rows);
}

/**
 * Triggers a clinical printable Batch Expiration Audit Report in a formatted print view.
 */
export function printBatchExpiryReport(pharmacy, batches) {
  const storeName = pharmacy?.name || 'Medivolix Participating Pharmacy';
  const licenseNo = pharmacy?.licenseNumber || 'Verified License';
  const address = pharmacy?.address || 'Indiranagar, Bengaluru';
  const phone = pharmacy?.phone || '+91 80 2525 1111';
  const reportDate = new Date().toLocaleString();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const criticalCount = batches.filter((b) => {
    const diff = Math.ceil((new Date(b.expiryDate) - today) / (1000 * 60 * 60 * 24));
    return diff > 0 && diff <= 15;
  }).length;

  const warningCount = batches.filter((b) => {
    const diff = Math.ceil((new Date(b.expiryDate) - today) / (1000 * 60 * 60 * 24));
    return diff > 15 && diff <= 45;
  }).length;

  const expiredCount = batches.filter((b) => {
    const diff = Math.ceil((new Date(b.expiryDate) - today) / (1000 * 60 * 60 * 24));
    return diff <= 0;
  }).length;

  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (!printWindow) {
    alert('Please allow popups for this site to generate the printable report.');
    return;
  }

  const tableRows = batches.map((b) => {
    const exp = new Date(b.expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    let badgeColor = '#059669';
    let statusText = `${diffDays} days left`;
    let actionText = 'Monitor';

    if (diffDays <= 0) {
      badgeColor = '#dc2626';
      statusText = 'EXPIRED';
      actionText = 'Quarantine & Dispose';
    } else if (diffDays <= 15) {
      badgeColor = '#dc2626';
      statusText = `CRITICAL (${diffDays}d)`;
      actionText = 'Priority Dispense / Return';
    } else if (diffDays <= 45) {
      badgeColor = '#d97706';
      statusText = `WARNING (${diffDays}d)`;
      actionText = 'Promote Front Shelf';
    }

    return `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${b.medicineName || 'Medicine'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${b.batchNumber || 'N/A'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${b.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${b.expiryDate}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: ${badgeColor}; font-weight: 700;">${statusText}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${actionText}</td>
      </tr>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Batch Expiration Audit Report - ${storeName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 32px; color: #0f172a; line-height: 1.4; }
          .header { border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: 800; color: #0f766e; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; background: #f8fafc; padding: 12px 16px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
          .kpi-row { display: flex; gap: 16px; margin-bottom: 24px; }
          .kpi-card { flex: 1; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; text-align: center; }
          .kpi-val { font-size: 24px; font-weight: 800; }
          .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 30px; }
          th { background-color: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
          .footer-note { font-size: 11px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 30px; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 40px; font-size: 13px; }
          .sign-line { width: 220px; border-top: 1px solid #0f172a; margin-top: 40px; text-align: center; font-size: 12px; color: #475569; }
          @media print {
            body { margin: 16mm; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 class="title">MEDIVOLIX HEALTHCARE NETWORK</h1>
              <div class="subtitle">Pharmacy Batch Expiration &amp; Inventory Quality Audit</div>
            </div>
            <button onclick="window.print()" style="background: #0f766e; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">
              Print / Save as PDF
            </button>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <strong>Pharmacy:</strong> ${storeName}<br/>
            <strong>Drug License:</strong> ${licenseNo}<br/>
            <strong>Address:</strong> ${address}
          </div>
          <div style="text-align: right;">
            <strong>Audit Date:</strong> ${reportDate}<br/>
            <strong>Phone Hotline:</strong> ${phone}<br/>
            <strong>Compliance Status:</strong> Active Quality Control
          </div>
        </div>

        <div class="kpi-row">
          <div class="kpi-card" style="background: #f8fafc;">
            <div class="kpi-val" style="color: #0f172a;">${batches.length}</div>
            <div class="kpi-label">Total Batches Monitored</div>
          </div>
          <div class="kpi-card" style="background: #fef2f2; border-color: #fecaca;">
            <div class="kpi-val" style="color: #dc2626;">${criticalCount}</div>
            <div class="kpi-label">Critical Expiry (&le;15 Days)</div>
          </div>
          <div class="kpi-card" style="background: #fffbeb; border-color: #fde68a;">
            <div class="kpi-val" style="color: #d97706;">${warningCount}</div>
            <div class="kpi-label">Warning Expiry (&le;45 Days)</div>
          </div>
          <div class="kpi-card" style="background: #f1f5f9;">
            <div class="kpi-val" style="color: #475569;">${expiredCount}</div>
            <div class="kpi-label">Expired / Quarantined</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Batch Number</th>
              <th style="text-align: center;">Stock Qty</th>
              <th>Expiry Date</th>
              <th>Expiry Status</th>
              <th>Action Required</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="6" style="padding: 16px; text-align: center;">No approaching expiration batches found.</td></tr>'}
          </tbody>
        </table>

        <div class="signature-section">
          <div>
            <div>Audit Prepared By: System Automated Review</div>
            <div class="sign-line">Quality Control Technician</div>
          </div>
          <div>
            <div>Licensed Pharmacist In-Charge:</div>
            <div class="sign-line">Pharmacist Signature &amp; Stamp</div>
          </div>
        </div>

        <div class="footer-note">
          Official Medivolix System Report. Generated pursuant to drug inventory quality tracking standards. Expired medications must not be dispensed and must be quarantined according to state pharmaceuticals regulations.
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
}

/**
 * Triggers a printable patient confirmation slip / pickup receipt for an inquiry.
 */
export function printInquirySlip(inquiry, pharmacyDetails = {}) {
  const storeName = inquiry.pharmacyName || pharmacyDetails.name || 'Participating Pharmacy';
  const storePhone = inquiry.pharmacyPhone || pharmacyDetails.phone || 'Store Contact';
  const storeAddress = pharmacyDetails.address || 'Local Pharmacy Counter';
  const medicineName = inquiry.medicineName || 'Prescribed Medicine';
  const requestedQty = inquiry.requestedQuantity || 1;
  const status = inquiry.status || 'PENDING';
  const refId = `MDX-REQ-${String(inquiry.id).padStart(5, '0')}`;
  const requestDate = inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString() : new Date().toLocaleString();
  const customerName = inquiry.customerName || 'Patient / Customer';
  const customerPhone = inquiry.customerPhone || 'Contact Provided';
  const notes = inquiry.responseNotes || inquiry.customerNotes || 'No additional remarks.';

  const isConfirmed = status === 'CONFIRMED';

  const printWindow = window.open('', '_blank', 'width=780,height=720');
  if (!printWindow) {
    alert('Please allow popups for this site to print the confirmation slip.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medivolix Availability Slip - ${refId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 24px; color: #0f172a; line-height: 1.4; }
          .slip-container { border: 2px dashed #0f766e; border-radius: 8px; padding: 24px; max-width: 680px; margin: 0 auto; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 16px; }
          .brand { font-size: 20px; font-weight: 800; color: #0f766e; }
          .brand-sub { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
          .badge { padding: 4px 12px; border-radius: 4px; font-weight: 800; font-size: 14px; text-transform: uppercase; }
          .badge-confirmed { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          .badge-pending { background: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }
          .badge-other { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
          .section { margin-bottom: 16px; }
          .section-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
          .med-highlight { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px 16px; margin-bottom: 16px; }
          .barcode-mock { letter-spacing: 4px; font-family: monospace; font-size: 18px; text-align: center; color: #334155; margin: 12px 0 6px 0; }
          .notice { font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; line-height: 1.5; text-align: center; }
          @media print {
            body { margin: 8mm; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: right; margin-bottom: 12px;">
          <button onclick="window.print()" style="background: #0f766e; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">
            Print Slip / Save as PDF
          </button>
        </div>

        <div class="slip-container">
          <div class="header">
            <div>
              <div class="brand">MEDIVOLIX</div>
              <div class="brand-sub">Medicine Availability Slip</div>
            </div>
            <div style="text-align: right;">
              <span class="badge ${isConfirmed ? 'badge-confirmed' : status === 'PENDING' ? 'badge-pending' : 'badge-other'}">
                ${status}
              </span>
              <div style="font-family: monospace; font-weight: 700; font-size: 12px; margin-top: 4px; color: #475569;">
                ${refId}
              </div>
            </div>
          </div>

          <div class="med-highlight">
            <div class="section-title" style="color: #166534;">Requested Medicine</div>
            <div style="font-size: 18px; font-weight: 800; color: #0f172a;">${medicineName}</div>
            <div style="font-size: 13px; color: #166534; font-weight: 600; margin-top: 2px;">
              Quantity Requested: ${requestedQty} units
            </div>
          </div>

          <div class="section">
            <div class="section-title">Participating Pharmacy</div>
            <div class="info-box grid-2">
              <div>
                <strong>Store:</strong> ${storeName}<br/>
                <strong>Address:</strong> ${storeAddress}
              </div>
              <div>
                <strong>Phone Hotline:</strong> ${storePhone}<br/>
                <strong>Status:</strong> Licensed Healthcare Partner
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Patient / Inquiry Details</div>
            <div class="info-box grid-2">
              <div>
                <strong>Patient:</strong> ${customerName}<br/>
                <strong>Phone:</strong> ${customerPhone}
              </div>
              <div>
                <strong>Inquiry Submitted:</strong> ${requestDate}<br/>
                <strong>Verification:</strong> In-App Confirmation
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Pharmacist Notes &amp; Reservation Details</div>
            <div class="info-box" style="font-size: 13px; color: #334155; font-style: italic;">
              "${notes}"
            </div>
          </div>

          <div class="barcode-mock">||| | |||| | |||||| || | |||| |||</div>
          <div style="text-align: center; font-size: 10px; color: #94a3b8; margin-bottom: 12px; font-family: monospace;">
            *${refId}*
          </div>

          <div class="notice">
            <strong>IMPORTANT REGULATORY NOTICE:</strong><br/>
            This digital slip confirms reported stock availability at the participating pharmacy. Medivolix does not sell pharmaceuticals online. Patients must present a valid, unexpired doctor's prescription at the pharmacy counter for Schedule H, H1, and X medications.
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
}
