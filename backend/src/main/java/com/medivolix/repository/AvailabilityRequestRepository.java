package com.medivolix.repository;

import com.medivolix.config.DatabaseConfig;
import com.medivolix.model.AvailabilityRequest;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class AvailabilityRequestRepository {

    public AvailabilityRequest create(AvailabilityRequest req) throws SQLException {
        String sql = "INSERT INTO availability_requests (customer_id, pharmacy_id, medicine_id, requested_quantity, " +
                     "customer_notes, status, pharmacy_notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, req.getCustomerId());
            ps.setInt(2, req.getPharmacyId());
            ps.setInt(3, req.getMedicineId());
            ps.setInt(4, Math.max(1, req.getRequestedQuantity()));
            ps.setString(5, req.getCustomerNotes());
            ps.setString(6, req.getStatus() != null ? req.getStatus().name() : "PENDING");
            ps.setString(7, req.getPharmacyNotes());
            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    req.setId(keys.getInt(1));
                }
            }
            return req;
        }
    }

    public Optional<AvailabilityRequest> findById(int id) {
        String sql = baseRequestSelect() + " WHERE ar.id = ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToRequest(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[AvailabilityRequestRepository] Error finding request: " + e.getMessage());
        }
        return Optional.empty();
    }

    public List<AvailabilityRequest> findByCustomerId(int customerId) {
        List<AvailabilityRequest> list = new ArrayList<>();
        String sql = baseRequestSelect() + " WHERE ar.customer_id = ? ORDER BY ar.created_at DESC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, customerId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToRequest(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[AvailabilityRequestRepository] Error listing customer requests: " + e.getMessage());
        }
        return list;
    }

    public List<AvailabilityRequest> findByPharmacyId(int pharmacyId) {
        List<AvailabilityRequest> list = new ArrayList<>();
        String sql = baseRequestSelect() + " WHERE ar.pharmacy_id = ? ORDER BY ar.created_at DESC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, pharmacyId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToRequest(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[AvailabilityRequestRepository] Error listing pharmacy requests: " + e.getMessage());
        }
        return list;
    }

    public boolean updateStatus(int requestId, int pharmacyId, AvailabilityRequest.Status status, String notes) {
        String sql = "UPDATE availability_requests SET status = ?, pharmacy_notes = COALESCE(?, pharmacy_notes) " +
                     "WHERE id = ? AND pharmacy_id = ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setString(2, notes);
            ps.setInt(3, requestId);
            ps.setInt(4, pharmacyId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[AvailabilityRequestRepository] Error updating status: " + e.getMessage());
            return false;
        }
    }

    public boolean cancelByCustomer(int requestId, int customerId) {
        String sql = "UPDATE availability_requests SET status = 'CANCELLED' " +
                     "WHERE id = ? AND customer_id = ? AND status = 'PENDING'";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, requestId);
            ps.setInt(2, customerId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[AvailabilityRequestRepository] Error cancelling request: " + e.getMessage());
            return false;
        }
    }

    private String baseRequestSelect() {
        return "SELECT ar.id, ar.customer_id, ar.pharmacy_id, ar.medicine_id, ar.requested_quantity, " +
               "ar.customer_notes, ar.status, ar.pharmacy_notes, ar.created_at, ar.updated_at, " +
               "u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone, " +
               "p.name AS pharmacy_name, p.phone AS pharmacy_phone, p.address_line1 AS pharmacy_address, " +
               "m.name AS medicine_name, m.strength, m.dosage_form " +
               "FROM availability_requests ar " +
               "JOIN users u ON ar.customer_id = u.id " +
               "JOIN pharmacies p ON ar.pharmacy_id = p.id " +
               "JOIN medicines m ON ar.medicine_id = m.id";
    }

    private AvailabilityRequest mapRowToRequest(ResultSet rs) throws SQLException {
        AvailabilityRequest r = new AvailabilityRequest();
        r.setId(rs.getInt("id"));
        r.setCustomerId(rs.getInt("customer_id"));
        r.setPharmacyId(rs.getInt("pharmacy_id"));
        r.setMedicineId(rs.getInt("medicine_id"));
        r.setRequestedQuantity(rs.getInt("requested_quantity"));
        r.setCustomerNotes(rs.getString("customer_notes"));
        r.setStatus(AvailabilityRequest.Status.valueOf(rs.getString("status")));
        r.setPharmacyNotes(rs.getString("pharmacy_notes"));

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) r.setCreatedAt(created.toLocalDateTime());
        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) r.setUpdatedAt(updated.toLocalDateTime());

        r.setCustomerName(rs.getString("customer_name"));
        r.setCustomerEmail(rs.getString("customer_email"));
        r.setCustomerPhone(rs.getString("customer_phone"));

        r.setPharmacyName(rs.getString("pharmacy_name"));
        r.setPharmacyPhone(rs.getString("pharmacy_phone"));
        r.setPharmacyAddress(rs.getString("pharmacy_address"));

        r.setMedicineName(rs.getString("medicine_name"));
        r.setStrength(rs.getString("strength"));
        r.setDosageForm(rs.getString("dosage_form"));
        return r;
    }
}
