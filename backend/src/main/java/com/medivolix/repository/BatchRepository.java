package com.medivolix.repository;

import com.medivolix.config.DatabaseConfig;
import com.medivolix.model.InventoryBatch;

import java.sql.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public class BatchRepository {

    public List<InventoryBatch> findByInventoryId(int inventoryId) {
        List<InventoryBatch> list = new ArrayList<>();
        String sql = "SELECT b.id, b.inventory_id, b.batch_number, b.quantity, b.expiry_date, b.status, " +
                     "b.created_at, b.updated_at, m.name AS medicine_name " +
                     "FROM inventory_batches b " +
                     "JOIN pharmacy_inventory pi ON b.inventory_id = pi.id " +
                     "JOIN medicines m ON pi.medicine_id = m.id " +
                     "WHERE b.inventory_id = ? ORDER BY b.expiry_date ASC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, inventoryId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToBatch(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[BatchRepository] Error finding batches by inventory: " + e.getMessage());
        }
        return list;
    }

    public List<InventoryBatch> findApproachingExpiry(int pharmacyId, int daysThreshold) {
        List<InventoryBatch> list = new ArrayList<>();
        String sql = "SELECT b.id, b.inventory_id, b.batch_number, b.quantity, b.expiry_date, b.status, " +
                     "b.created_at, b.updated_at, m.name AS medicine_name " +
                     "FROM inventory_batches b " +
                     "JOIN pharmacy_inventory pi ON b.inventory_id = pi.id " +
                     "JOIN medicines m ON pi.medicine_id = m.id " +
                     "WHERE pi.pharmacy_id = ? AND b.status = 'ACTIVE' " +
                     "AND b.expiry_date <= DATE_ADD(CURRENT_DATE, INTERVAL ? DAY) " +
                     "ORDER BY b.expiry_date ASC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, pharmacyId);
            ps.setInt(2, daysThreshold);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToBatch(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[BatchRepository] Error finding expiring batches: " + e.getMessage());
        }
        return list;
    }

    public InventoryBatch create(InventoryBatch batch) throws SQLException {
        String sql = "INSERT INTO inventory_batches (inventory_id, batch_number, quantity, expiry_date, status) " +
                     "VALUES (?, ?, ?, ?, ?)";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, batch.getInventoryId());
            ps.setString(2, batch.getBatchNumber().trim());
            ps.setInt(3, Math.max(0, batch.getQuantity()));
            ps.setDate(4, Date.valueOf(batch.getExpiryDate()));
            ps.setString(5, batch.getStatus() != null ? batch.getStatus().name() : "ACTIVE");
            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    batch.setId(keys.getInt(1));
                }
            }
            return batch;
        }
    }

    private InventoryBatch mapRowToBatch(ResultSet rs) throws SQLException {
        InventoryBatch b = new InventoryBatch();
        b.setId(rs.getInt("id"));
        b.setInventoryId(rs.getInt("inventory_id"));
        b.setBatchNumber(rs.getString("batch_number"));
        b.setQuantity(rs.getInt("quantity"));

        Date exp = rs.getDate("expiry_date");
        if (exp != null) {
            LocalDate expDate = exp.toLocalDate();
            b.setExpiryDate(expDate);
            b.setDaysUntilExpiry(ChronoUnit.DAYS.between(LocalDate.now(), expDate));
        }

        b.setStatus(InventoryBatch.Status.valueOf(rs.getString("status")));

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) b.setCreatedAt(created.toLocalDateTime());
        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) b.setUpdatedAt(updated.toLocalDateTime());

        b.setMedicineName(rs.getString("medicine_name"));
        return b;
    }
}
