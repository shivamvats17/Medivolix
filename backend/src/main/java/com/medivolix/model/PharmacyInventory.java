package com.medivolix.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PharmacyInventory {

    private Integer id;
    private Integer pharmacyId;
    private Integer medicineId;
    private Integer stockQuantity;
    private BigDecimal price;
    private Boolean isAvailable;
    private Integer lowStockThreshold;
    private LocalDateTime lastStockUpdate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Joined fields for convenience in views and APIs
    private String medicineName;
    private String brandName;
    private String genericName;
    private String strength;
    private String dosageForm;
    private Boolean prescriptionRequired;

    private String pharmacyName;
    private String pharmacyPhone;
    private String pharmacyAddress;
    private String pharmacyCity;
    private Double pharmacyLatitude;
    private Double pharmacyLongitude;
    private Double distanceKm;

    // Dynamic calculated stock indicators
    private String stockStatus; // AVAILABLE, LOW_STOCK, UNAVAILABLE, OUTDATED
    private Boolean isFresh;

    public PharmacyInventory() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getPharmacyId() { return pharmacyId; }
    public void setPharmacyId(Integer pharmacyId) { this.pharmacyId = pharmacyId; }

    public Integer getMedicineId() { return medicineId; }
    public void setMedicineId(Integer medicineId) { this.medicineId = medicineId; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public LocalDateTime getLastStockUpdate() { return lastStockUpdate; }
    public void setLastStockUpdate(LocalDateTime lastStockUpdate) { this.lastStockUpdate = lastStockUpdate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }

    public String getGenericName() { return genericName; }
    public void setGenericName(String genericName) { this.genericName = genericName; }

    public String getStrength() { return strength; }
    public void setStrength(String strength) { this.strength = strength; }

    public String getDosageForm() { return dosageForm; }
    public void setDosageForm(String dosageForm) { this.dosageForm = dosageForm; }

    public Boolean getPrescriptionRequired() { return prescriptionRequired; }
    public void setPrescriptionRequired(Boolean prescriptionRequired) { this.prescriptionRequired = prescriptionRequired; }

    public String getPharmacyName() { return pharmacyName; }
    public void setPharmacyName(String pharmacyName) { this.pharmacyName = pharmacyName; }

    public String getPharmacyPhone() { return pharmacyPhone; }
    public void setPharmacyPhone(String pharmacyPhone) { this.pharmacyPhone = pharmacyPhone; }

    public String getPharmacyAddress() { return pharmacyAddress; }
    public void setPharmacyAddress(String pharmacyAddress) { this.pharmacyAddress = pharmacyAddress; }

    public String getPharmacyCity() { return pharmacyCity; }
    public void setPharmacyCity(String pharmacyCity) { this.pharmacyCity = pharmacyCity; }

    public Double getPharmacyLatitude() { return pharmacyLatitude; }
    public void setPharmacyLatitude(Double pharmacyLatitude) { this.pharmacyLatitude = pharmacyLatitude; }

    public Double getPharmacyLongitude() { return pharmacyLongitude; }
    public void setPharmacyLongitude(Double pharmacyLongitude) { this.pharmacyLongitude = pharmacyLongitude; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getStockStatus() { return stockStatus; }
    public void setStockStatus(String stockStatus) { this.stockStatus = stockStatus; }

    public Boolean getIsFresh() { return isFresh; }
    public void setIsFresh(Boolean isFresh) { this.isFresh = isFresh; }
}
