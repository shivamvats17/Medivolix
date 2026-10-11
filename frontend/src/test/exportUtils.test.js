import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportToCsv,
  exportInventoryCsv,
  exportExpiringBatchesCsv,
  exportAuditLogsCsv
} from '../utils/exportUtils';

describe('exportUtils', () => {
  let createdBlob = null;
  let downloadedFilename = null;

  beforeEach(() => {
    createdBlob = null;
    downloadedFilename = null;

    // Mock URL.createObjectURL and URL.revokeObjectURL
    globalThis.URL.createObjectURL = vi.fn((blob) => {
      createdBlob = blob;
      return 'blob:mock-url';
    });
    globalThis.URL.revokeObjectURL = vi.fn();

    // Mock anchor click
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          setAttribute: (attr, val) => {
            if (attr === 'download') downloadedFilename = val;
          },
          click: vi.fn(),
          href: ''
        };
      }
      return document.createElement(tag);
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  it('exportToCsv generates UTF-8 BOM and RFC 4180 quotes for commas and quotes', async () => {
    const headers = ['Name', 'Details'];
    const rows = [
      ['Paracetamol', 'Common "fever" reducer'],
      ['Amoxicillin, Clavulanate', 'Antibiotic']
    ];

    exportToCsv('test_export.csv', headers, rows);

    expect(downloadedFilename).toBe('test_export.csv');
    expect(createdBlob).not.toBeNull();

    const buffer = await createdBlob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    // Verify UTF-8 BOM bytes (0xEF, 0xBB, 0xBF)
    expect(bytes[0]).toBe(0xef);
    expect(bytes[1]).toBe(0xbb);
    expect(bytes[2]).toBe(0xbf);

    const text = await createdBlob.text();
    // Verify escaping
    expect(text).toContain('"Name","Details"');
    expect(text).toContain('"Paracetamol","Common ""fever"" reducer"');
    expect(text).toContain('"Amoxicillin, Clavulanate","Antibiotic"');
  });

  it('exportInventoryCsv correctly maps inventory rows and formats price', async () => {
    const inventory = [
      {
        medicineId: 1,
        medicineName: 'Augmentin 625 Duo',
        genericName: 'Amoxicillin + Clavulanate',
        dosageForm: 'Tablet',
        strength: '625mg',
        category: 'Antibiotic',
        stockQuantity: 45,
        price: 204.5,
        lowStockThreshold: 10,
        stockStatus: 'AVAILABLE',
        lastUpdated: '2026-10-11T10:00:00Z'
      }
    ];

    exportInventoryCsv(inventory, 'CarePlus Pharmacy');

    expect(downloadedFilename).toContain('medivolix_inventory_careplus_pharmacy_');
    const text = await createdBlob.text();
    expect(text).toContain('"Augmentin 625 Duo"');
    expect(text).toContain('"204.50"');
    expect(text).toContain('"AVAILABLE"');
  });

  it('exportExpiringBatchesCsv calculates days remaining and risk categories', async () => {
    const today = new Date();
    const in10Days = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const batches = [
      { id: 1, medicineName: 'Augmentin', batchNumber: 'B1', quantity: 20, expiryDate: in10Days },
      { id: 2, medicineName: 'Dolo 650', batchNumber: 'B2', quantity: 50, expiryDate: in30Days }
    ];

    exportExpiringBatchesCsv(batches, 'CarePlus');

    const text = await createdBlob.text();
    expect(text).toContain('"B1"');
    expect(text).toContain('CRITICAL (<15 Days)');
    expect(text).toContain('"B2"');
    expect(text).toContain('WARNING (<45 Days)');
  });

  it('exportAuditLogsCsv formats quantity delta properly', async () => {
    const logs = [
      {
        id: 101,
        createdAt: '2026-10-11T12:00:00Z',
        inventoryId: 1,
        medicineName: 'Augmentin',
        oldQuantity: 30,
        newQuantity: 45,
        changeReason: 'New batch shipment',
        changedBy: 2
      }
    ];

    exportAuditLogsCsv(logs, 'CarePlus');

    const text = await createdBlob.text();
    expect(text).toContain('"+15"');
    expect(text).toContain('"New batch shipment"');
  });
});
