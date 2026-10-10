package com.medivolix.dto;

import com.medivolix.model.Medicine;
import com.medivolix.model.PharmacyInventory;

import java.util.ArrayList;
import java.util.List;

public class MedicineSearchResultDto {
    private Medicine medicine;
    private List<PharmacyInventory> availablePharmacies = new ArrayList<>();
    private int totalReportingPharmacies;
    private boolean anyAvailable;

    public MedicineSearchResultDto() {}

    public MedicineSearchResultDto(Medicine medicine) {
        this.medicine = medicine;
    }

    public Medicine getMedicine() { return medicine; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }

    public List<PharmacyInventory> getAvailablePharmacies() { return availablePharmacies; }
    public void setAvailablePharmacies(List<PharmacyInventory> availablePharmacies) {
        this.availablePharmacies = availablePharmacies;
        this.totalReportingPharmacies = availablePharmacies != null ? availablePharmacies.size() : 0;
        this.anyAvailable = availablePharmacies != null && availablePharmacies.stream()
                .anyMatch(i -> "AVAILABLE".equals(i.getStockStatus()) || "LOW_STOCK".equals(i.getStockStatus()));
    }

    public int getTotalReportingPharmacies() { return totalReportingPharmacies; }
    public void setTotalReportingPharmacies(int totalReportingPharmacies) { this.totalReportingPharmacies = totalReportingPharmacies; }

    public boolean isAnyAvailable() { return anyAvailable; }
    public void setAnyAvailable(boolean anyAvailable) { this.anyAvailable = anyAvailable; }
}
