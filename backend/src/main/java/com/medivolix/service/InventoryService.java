package com.medivolix.service;

import com.medivolix.config.AppConfig;
import com.medivolix.dto.BatchRequest;
import com.medivolix.dto.InventoryItemRequest;
import com.medivolix.model.InventoryAuditLog;
import com.medivolix.model.InventoryBatch;
import com.medivolix.model.PharmacyInventory;
import com.medivolix.repository.AuditLogRepository;
import com.medivolix.repository.BatchRepository;
import com.medivolix.repository.InventoryRepository;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public class InventoryService {

    private final InventoryRepository inventoryRepository = new InventoryRepository();
    private final BatchRepository batchRepository = new BatchRepository();
    private final AuditLogRepository auditLogRepository = new AuditLogRepository();

    public Optional<PharmacyInventory> findById(int id) {
        return inventoryRepository.findById(id);
    }

    public List<PharmacyInventory> getPharmacyInventory(int pharmacyId) {
        return inventoryRepository.findByPharmacyId(pharmacyId);
    }

    public List<PharmacyInventory> getLowStockItems(int pharmacyId) {
        return inventoryRepository.findLowStockByPharmacy(pharmacyId);
    }

    public List<InventoryBatch> getApproachingExpiry(int pharmacyId) {
        int warningDays = AppConfig.getExpiryWarningDays();
        return batchRepository.findApproachingExpiry(pharmacyId, warningDays);
    }

    public PharmacyInventory saveOrUpdateItem(int pharmacyId, int userId, InventoryItemRequest req) throws SQLException {
        if (req.getMedicineId() == null) {
            throw new IllegalArgumentException("Medicine ID is required");
        }
        if (req.getStockQuantity() == null || req.getStockQuantity() < 0) {
            throw new IllegalArgumentException("Stock quantity must be zero or positive");
        }
        if (req.getPrice() == null || req.getPrice().doubleValue() < 0) {
            throw new IllegalArgumentException("Price must be a valid non-negative amount");
        }

        PharmacyInventory item = new PharmacyInventory();
        item.setPharmacyId(pharmacyId);
        item.setMedicineId(req.getMedicineId());
        item.setStockQuantity(req.getStockQuantity());
        item.setPrice(req.getPrice());
        item.setIsAvailable(req.getIsAvailable() != null ? req.getIsAvailable() : (req.getStockQuantity() > 0));
        item.setLowStockThreshold(req.getLowStockThreshold() != null ? req.getLowStockThreshold() : 10);

        PharmacyInventory saved = inventoryRepository.upsertInventory(item, userId);

        // If batch details are also provided, create the initial batch
        if (req.getBatchNumber() != null && !req.getBatchNumber().trim().isEmpty() && req.getExpiryDate() != null) {
            if (req.getExpiryDate().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Cannot add an expired batch to available inventory");
            }
            InventoryBatch batch = new InventoryBatch();
            batch.setInventoryId(saved.getId());
            batch.setBatchNumber(req.getBatchNumber().trim());
            batch.setQuantity(req.getStockQuantity());
            batch.setExpiryDate(req.getExpiryDate());
            batch.setStatus(InventoryBatch.Status.ACTIVE);
            batchRepository.create(batch);
        }

        return saved;
    }

    public boolean markUnavailable(int inventoryId, int pharmacyId, int userId) throws SQLException {
        return inventoryRepository.markUnavailable(inventoryId, pharmacyId, userId);
    }

    public InventoryBatch addBatch(int pharmacyId, BatchRequest req) throws SQLException {
        if (req.getInventoryId() == null || req.getBatchNumber() == null || req.getExpiryDate() == null) {
            throw new IllegalArgumentException("Inventory ID, batch number, and expiry date are required");
        }
        if (req.getExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Batch expiry date cannot be in the past");
        }

        // Validate inventory belongs to this pharmacy
        Optional<PharmacyInventory> invOpt = inventoryRepository.findById(req.getInventoryId());
        if (invOpt.isEmpty() || !invOpt.get().getPharmacyId().equals(pharmacyId)) {
            throw new SecurityException("Inventory record does not belong to your pharmacy");
        }

        InventoryBatch batch = new InventoryBatch();
        batch.setInventoryId(req.getInventoryId());
        batch.setBatchNumber(req.getBatchNumber().trim());
        batch.setQuantity(req.getQuantity() != null ? req.getQuantity() : 0);
        batch.setExpiryDate(req.getExpiryDate());
        batch.setStatus(InventoryBatch.Status.ACTIVE);

        return batchRepository.create(batch);
    }

    public List<InventoryAuditLog> getAuditLogs(int pharmacyId, int limit) {
        return auditLogRepository.findByPharmacyId(pharmacyId, limit);
    }
}
