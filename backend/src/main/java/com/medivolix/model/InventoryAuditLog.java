package com.medivolix.model;

import java.time.LocalDateTime;

public class InventoryAuditLog {

    private Integer id;
    private Integer pharmacyId;
    private Integer medicineId;
    private Integer userId;
    private String action;
    private Integer quantityChange;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String details;
    private LocalDateTime createdAt;

    // View helpers
    private String medicineName;
    private String userName;

    public InventoryAuditLog() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getPharmacyId() { return pharmacyId; }
    public void setPharmacyId(Integer pharmacyId) { this.pharmacyId = pharmacyId; }

    public Integer getMedicineId() { return medicineId; }
    public void setMedicineId(Integer medicineId) { this.medicineId = medicineId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Integer getQuantityChange() { return quantityChange; }
    public void setQuantityChange(Integer quantityChange) { this.quantityChange = quantityChange; }

    public Integer getPreviousQuantity() { return previousQuantity; }
    public void setPreviousQuantity(Integer previousQuantity) { this.previousQuantity = previousQuantity; }

    public Integer getNewQuantity() { return newQuantity; }
    public void setNewQuantity(Integer newQuantity) { this.newQuantity = newQuantity; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}
