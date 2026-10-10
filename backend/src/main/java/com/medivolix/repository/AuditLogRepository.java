package com.medivolix.repository;

import com.medivolix.config.DatabaseConfig;
import com.medivolix.model.InventoryAuditLog;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AuditLogRepository {

    public List<InventoryAuditLog> findByPharmacyId(int pharmacyId, int limit) {
        List<InventoryAuditLog> list = new ArrayList<>();
        String sql = "SELECT al.id, al.pharmacy_id, al.medicine_id, al.user_id, al.action, " +
                     "al.quantity_change, al.previous_quantity, al.new_quantity, al.details, al.created_at, " +
                     "m.name AS medicine_name, u.full_name AS user_name " +
                     "FROM inventory_audit_logs al " +
                     "JOIN medicines m ON al.medicine_id = m.id " +
                     "JOIN users u ON al.user_id = u.id " +
                     "WHERE al.pharmacy_id = ? " +
                     "ORDER BY al.created_at DESC LIMIT ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, pharmacyId);
            ps.setInt(2, Math.max(1, limit));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    InventoryAuditLog log = new InventoryAuditLog();
                    log.setId(rs.getInt("id"));
                    log.setPharmacyId(rs.getInt("pharmacy_id"));
                    log.setMedicineId(rs.getInt("medicine_id"));
                    log.setUserId(rs.getInt("user_id"));
                    log.setAction(rs.getString("action"));
                    log.setQuantityChange(rs.getInt("quantity_change"));
                    log.setPreviousQuantity(rs.getInt("previous_quantity"));
                    log.setNewQuantity(rs.getInt("new_quantity"));
                    log.setDetails(rs.getString("details"));
                    Timestamp c = rs.getTimestamp("created_at");
                    if (c != null) log.setCreatedAt(c.toLocalDateTime());
                    log.setMedicineName(rs.getString("medicine_name"));
                    log.setUserName(rs.getString("user_name"));
                    list.add(log);
                }
            }
        } catch (SQLException e) {
            System.err.println("[AuditLogRepository] Error listing audit logs: " + e.getMessage());
        }
        return list;
    }
}
