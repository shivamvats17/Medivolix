package com.medivolix.dto;

import com.medivolix.model.User;

public class UserDto {

    private Integer id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String status;
    private Integer pharmacyId; // Populated if user is PHARMACY_ADMIN
    private String pharmacyName;

    public UserDto() {}

    public UserDto(User user) {
        if (user != null) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.phone = user.getPhone();
            this.role = user.getRole() != null ? user.getRole().name() : null;
            this.status = user.getStatus() != null ? user.getStatus().name() : null;
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getPharmacyId() { return pharmacyId; }
    public void setPharmacyId(Integer pharmacyId) { this.pharmacyId = pharmacyId; }

    public String getPharmacyName() { return pharmacyName; }
    public void setPharmacyName(String pharmacyName) { this.pharmacyName = pharmacyName; }
}
