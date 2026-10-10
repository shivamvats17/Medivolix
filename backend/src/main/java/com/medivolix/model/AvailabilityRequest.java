package com.medivolix.model;

import java.time.LocalDateTime;

public class AvailabilityRequest {

    public enum Status {
        PENDING,
        CONFIRMED,
        UNAVAILABLE,
        CANCELLED,
        COMPLETED
    }

    private Integer id;
    private Integer customerId;
    private Integer pharmacyId;
    private Integer medicineId;
    private Integer requestedQuantity;
    private String customerNotes;
    private Status status;
    private String pharmacyNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // View helpers
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String pharmacyName;
    private String pharmacyPhone;
    private String pharmacyAddress;
    private String medicineName;
    private String strength;
    private String dosageForm;

    public AvailabilityRequest() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getCustomerId() { return customerId; }
    public void setCustomerId(Integer customerId) { this.customerId = customerId; }

    public Integer getPharmacyId() { return pharmacyId; }
    public void setPharmacyId(Integer pharmacyId) { this.pharmacyId = pharmacyId; }

    public Integer getMedicineId() { return medicineId; }
    public void setMedicineId(Integer medicineId) { this.medicineId = medicineId; }

    public Integer getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(Integer requestedQuantity) { this.requestedQuantity = requestedQuantity; }

    public String getCustomerNotes() { return customerNotes; }
    public void setCustomerNotes(String customerNotes) { this.customerNotes = customerNotes; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getPharmacyNotes() { return pharmacyNotes; }
    public void setPharmacyNotes(String pharmacyNotes) { this.pharmacyNotes = pharmacyNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getPharmacyName() { return pharmacyName; }
    public void setPharmacyName(String pharmacyName) { this.pharmacyName = pharmacyName; }

    public String getPharmacyPhone() { return pharmacyPhone; }
    public void setPharmacyPhone(String pharmacyPhone) { this.pharmacyPhone = pharmacyPhone; }

    public String getPharmacyAddress() { return pharmacyAddress; }
    public void setPharmacyAddress(String pharmacyAddress) { this.pharmacyAddress = pharmacyAddress; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getStrength() { return strength; }
    public void setStrength(String strength) { this.strength = strength; }

    public String getDosageForm() { return dosageForm; }
    public void setDosageForm(String dosageForm) { this.dosageForm = dosageForm; }
}
