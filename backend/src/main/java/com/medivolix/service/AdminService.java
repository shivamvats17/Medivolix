package com.medivolix.service;

import com.medivolix.config.DatabaseConfig;
import com.medivolix.dto.AdminOverviewDto;
import com.medivolix.dto.UserDto;
import com.medivolix.model.Pharmacy;
import com.medivolix.model.User;
import com.medivolix.repository.PharmacyRepository;
import com.medivolix.repository.UserRepository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

public class AdminService {

    private final UserRepository userRepository = new UserRepository();
    private final PharmacyRepository pharmacyRepository = new PharmacyRepository();

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public List<Pharmacy> getAllPharmacies() {
        return pharmacyRepository.findAll();
    }

    public boolean approvePharmacy(int pharmacyId) {
        return pharmacyRepository.updateStatus(pharmacyId, Pharmacy.Status.APPROVED);
    }

    public boolean suspendPharmacy(int pharmacyId) {
        return pharmacyRepository.updateStatus(pharmacyId, Pharmacy.Status.SUSPENDED);
    }

    public AdminOverviewDto getOverview() {
        AdminOverviewDto stats = new AdminOverviewDto();
        String sql = "SELECT " +
                     "(SELECT COUNT(*) FROM users) AS total_users, " +
                     "(SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER') AS total_customers, " +
                     "(SELECT COUNT(*) FROM pharmacies) AS total_pharmacies, " +
                     "(SELECT COUNT(*) FROM pharmacies WHERE status = 'PENDING') AS pending_pharmacies, " +
                     "(SELECT COUNT(*) FROM pharmacies WHERE status = 'APPROVED') AS approved_pharmacies, " +
                     "(SELECT COUNT(*) FROM medicines) AS total_medicines, " +
                     "(SELECT COUNT(*) FROM pharmacy_inventory) AS total_inventory, " +
                     "(SELECT COUNT(*) FROM availability_requests) AS total_requests, " +
                     "(SELECT COUNT(*) FROM availability_requests WHERE status = 'PENDING') AS pending_requests";

        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                stats.setTotalUsers(rs.getInt("total_users"));
                stats.setTotalCustomers(rs.getInt("total_customers"));
                stats.setTotalPharmacies(rs.getInt("total_pharmacies"));
                stats.setPendingPharmacies(rs.getInt("pending_pharmacies"));
                stats.setApprovedPharmacies(rs.getInt("approved_pharmacies"));
                stats.setTotalMedicines(rs.getInt("total_medicines"));
                stats.setTotalInventoryItems(rs.getInt("total_inventory"));
                stats.setTotalRequests(rs.getInt("total_requests"));
                stats.setPendingRequests(rs.getInt("pending_requests"));
            }
        } catch (SQLException e) {
            System.err.println("[AdminService] Error loading system overview metrics: " + e.getMessage());
        }
        return stats;
    }
}
