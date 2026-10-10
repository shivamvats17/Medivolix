package com.medivolix.dto;

public class AdminOverviewDto {
    private int totalUsers;
    private int totalCustomers;
    private int totalPharmacies;
    private int pendingPharmacies;
    private int approvedPharmacies;
    private int totalMedicines;
    private int totalInventoryItems;
    private int totalRequests;
    private int pendingRequests;

    public AdminOverviewDto() {}

    public int getTotalUsers() { return totalUsers; }
    public void setTotalUsers(int totalUsers) { this.totalUsers = totalUsers; }

    public int getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(int totalCustomers) { this.totalCustomers = totalCustomers; }

    public int getTotalPharmacies() { return totalPharmacies; }
    public void setTotalPharmacies(int totalPharmacies) { this.totalPharmacies = totalPharmacies; }

    public int getPendingPharmacies() { return pendingPharmacies; }
    public void setPendingPharmacies(int pendingPharmacies) { this.pendingPharmacies = pendingPharmacies; }

    public int getApprovedPharmacies() { return approvedPharmacies; }
    public void setApprovedPharmacies(int approvedPharmacies) { this.approvedPharmacies = approvedPharmacies; }

    public int getTotalMedicines() { return totalMedicines; }
    public void setTotalMedicines(int totalMedicines) { this.totalMedicines = totalMedicines; }

    public int getTotalInventoryItems() { return totalInventoryItems; }
    public void setTotalInventoryItems(int totalInventoryItems) { this.totalInventoryItems = totalInventoryItems; }

    public int getTotalRequests() { return totalRequests; }
    public void setTotalRequests(int totalRequests) { this.totalRequests = totalRequests; }

    public int getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(int pendingRequests) { this.pendingRequests = pendingRequests; }
}
