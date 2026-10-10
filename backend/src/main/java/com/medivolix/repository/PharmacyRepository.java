package com.medivolix.repository;

import com.medivolix.config.DatabaseConfig;
import com.medivolix.model.Pharmacy;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class PharmacyRepository {

    public Optional<Pharmacy> findById(int id) {
        String sql = "SELECT id, name, license_number, phone, email, address_line1, address_line2, " +
                     "city, state, postal_code, latitude, longitude, operating_hours, status, created_at, updated_at " +
                     "FROM pharmacies WHERE id = ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToPharmacy(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[PharmacyRepository] Error finding pharmacy by id: " + e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<Pharmacy> findByAdminUserId(int userId) {
        String sql = "SELECT p.id, p.name, p.license_number, p.phone, p.email, p.address_line1, p.address_line2, " +
                     "p.city, p.state, p.postal_code, p.latitude, p.longitude, p.operating_hours, p.status, p.created_at, p.updated_at " +
                     "FROM pharmacies p " +
                     "INNER JOIN pharmacy_admins pa ON p.id = pa.pharmacy_id " +
                     "WHERE pa.user_id = ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToPharmacy(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[PharmacyRepository] Error finding pharmacy by user id: " + e.getMessage());
        }
        return Optional.empty();
    }

    public List<Pharmacy> findAllApproved() {
        List<Pharmacy> list = new ArrayList<>();
        String sql = "SELECT id, name, license_number, phone, email, address_line1, address_line2, " +
                     "city, state, postal_code, latitude, longitude, operating_hours, status, created_at, updated_at " +
                     "FROM pharmacies WHERE status = 'APPROVED' ORDER BY name ASC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToPharmacy(rs));
            }
        } catch (SQLException e) {
            System.err.println("[PharmacyRepository] Error listing approved pharmacies: " + e.getMessage());
        }
        return list;
    }

    public List<Pharmacy> findAll() {
        List<Pharmacy> list = new ArrayList<>();
        String sql = "SELECT id, name, license_number, phone, email, address_line1, address_line2, " +
                     "city, state, postal_code, latitude, longitude, operating_hours, status, created_at, updated_at " +
                     "FROM pharmacies ORDER BY created_at DESC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToPharmacy(rs));
            }
        } catch (SQLException e) {
            System.err.println("[PharmacyRepository] Error listing all pharmacies: " + e.getMessage());
        }
        return list;
    }

    public boolean updateStatus(int pharmacyId, Pharmacy.Status status) {
        String sql = "UPDATE pharmacies SET status = ? WHERE id = ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setInt(2, pharmacyId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[PharmacyRepository] Error updating pharmacy status: " + e.getMessage());
            return false;
        }
    }

    private Pharmacy mapRowToPharmacy(ResultSet rs) throws SQLException {
        Pharmacy p = new Pharmacy();
        p.setId(rs.getInt("id"));
        p.setName(rs.getString("name"));
        p.setLicenseNumber(rs.getString("license_number"));
        p.setPhone(rs.getString("phone"));
        p.setEmail(rs.getString("email"));
        p.setAddressLine1(rs.getString("address_line1"));
        p.setAddressLine2(rs.getString("address_line2"));
        p.setCity(rs.getString("city"));
        p.setState(rs.getString("state"));
        p.setPostalCode(rs.getString("postal_code"));

        BigDecimal lat = rs.getBigDecimal("latitude");
        if (lat != null) p.setLatitude(lat.doubleValue());
        BigDecimal lng = rs.getBigDecimal("longitude");
        if (lng != null) p.setLongitude(lng.doubleValue());

        p.setOperatingHours(rs.getString("operating_hours"));
        p.setStatus(Pharmacy.Status.valueOf(rs.getString("status")));

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) p.setCreatedAt(created.toLocalDateTime());
        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) p.setUpdatedAt(updated.toLocalDateTime());
        return p;
    }
}
