package com.medivolix.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class InventoryBatch {

    public enum Status {
        ACTIVE,
        EXPIRED,
        DEPLETED,
        QUARANTINED
    }

    private Integer id;
    private Integer inventoryId;
    private String batchNumber;
    private Integer quantity;
    private LocalDate expiryDate;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // View helpers
    private String medicineName;
    private Long daysUntilExpiry;

    public InventoryBatch() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getInventoryId() { return inventoryId; }
    public void setInventoryId(Integer inventoryId) { this.inventoryId = inventoryId; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public Long getDaysUntilExpiry() { return daysUntilExpiry; }
    public void setDaysUntilExpiry(Long daysUntilExpiry) { this.daysUntilExpiry = daysUntilExpiry; }
}
