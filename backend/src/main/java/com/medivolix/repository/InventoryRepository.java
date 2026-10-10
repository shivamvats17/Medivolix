package com.medivolix.repository;

import com.medivolix.config.DatabaseConfig;
import com.medivolix.model.PharmacyInventory;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class InventoryRepository {

    public Optional<PharmacyInventory> findById(int id) {
        String sql = baseInventorySelect() + " WHERE pi.id = ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToInventory(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[InventoryRepository] Error finding inventory by id: " + e.getMessage());
        }
        return Optional.empty();
    }

    public List<PharmacyInventory> findByPharmacyId(int pharmacyId) {
        List<PharmacyInventory> list = new ArrayList<>();
        String sql = baseInventorySelect() + " WHERE pi.pharmacy_id = ? ORDER BY m.name ASC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, pharmacyId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToInventory(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[InventoryRepository] Error finding inventory by pharmacy: " + e.getMessage());
        }
        return list;
    }

    public List<PharmacyInventory> findLowStockByPharmacy(int pharmacyId) {
        List<PharmacyInventory> list = new ArrayList<>();
        String sql = baseInventorySelect() +
                     " WHERE pi.pharmacy_id = ? AND pi.stock_quantity <= pi.low_stock_threshold ORDER BY pi.stock_quantity ASC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, pharmacyId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToInventory(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[InventoryRepository] Error finding low stock: " + e.getMessage());
        }
        return list;
    }

    /**
     * Finds all APPROVED pharmacies reporting stock for a given medicine.
     */
    public List<PharmacyInventory> findReportingPharmaciesForMedicine(int medicineId) {
        List<PharmacyInventory> list = new ArrayList<>();
        String sql = baseInventorySelect() +
                     " WHERE pi.medicine_id = ? AND p.status = 'APPROVED' " +
                     " ORDER BY pi.is_available DESC, pi.stock_quantity DESC, pi.last_stock_update DESC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, medicineId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToInventory(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[InventoryRepository] Error finding pharmacies for medicine: " + e.getMessage());
        }
        return list;
    }

    public Optional<PharmacyInventory> findByPharmacyAndMedicine(int pharmacyId, int medicineId) {
        String sql = baseInventorySelect() + " WHERE pi.pharmacy_id = ? AND pi.medicine_id = ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, pharmacyId);
            ps.setInt(2, medicineId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToInventory(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[InventoryRepository] Error finding inventory record: " + e.getMessage());
        }
        return Optional.empty();
    }

    /**
     * Inserts or updates inventory in a database transaction with audit logging.
     */
    public PharmacyInventory upsertInventory(PharmacyInventory item, int userId) throws SQLException {
        try (Connection con = DatabaseConfig.getConnection()) {
            con.setAutoCommit(false);
            try {
                // Check if already exists
                String checkSql = "SELECT id, stock_quantity FROM pharmacy_inventory WHERE pharmacy_id = ? AND medicine_id = ?";
                Integer existingId = null;
                int previousQuantity = 0;

                try (PreparedStatement psCheck = con.prepareStatement(checkSql)) {
                    psCheck.setInt(1, item.getPharmacyId());
                    psCheck.setInt(2, item.getMedicineId());
                    try (ResultSet rs = psCheck.executeQuery()) {
                        if (rs.next()) {
                            existingId = rs.getInt("id");
                            previousQuantity = rs.getInt("stock_quantity");
                        }
                    }
                }

                if (existingId == null) {
                    // INSERT
                    String insertSql = "INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, stock_quantity, price, is_available, low_stock_threshold, last_stock_update) " +
                                       "VALUES (?, ?, ?, ?, ?, ?, NOW())";
                    try (PreparedStatement psIns = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                        psIns.setInt(1, item.getPharmacyId());
                        psIns.setInt(2, item.getMedicineId());
                        psIns.setInt(3, Math.max(0, item.getStockQuantity()));
                        psIns.setBigDecimal(4, item.getPrice());
                        psIns.setBoolean(5, item.getIsAvailable() != null ? item.getIsAvailable() : (item.getStockQuantity() > 0));
                        psIns.setInt(6, item.getLowStockThreshold() != null ? item.getLowStockThreshold() : 10);
                        psIns.executeUpdate();

                        try (ResultSet keys = psIns.getGeneratedKeys()) {
                            if (keys.next()) {
                                item.setId(keys.getInt(1));
                            }
                        }
                    }

                    // Audit log
                    insertAuditLog(con, item.getPharmacyId(), item.getMedicineId(), userId, "STOCK_ADD",
                            item.getStockQuantity(), 0, item.getStockQuantity(), "New inventory added to pharmacy catalog");
                } else {
                    // UPDATE
                    item.setId(existingId);
                    String updateSql = "UPDATE pharmacy_inventory SET stock_quantity = ?, price = ?, is_available = ?, " +
                                       "low_stock_threshold = ?, last_stock_update = NOW() WHERE id = ?";
                    try (PreparedStatement psUp = con.prepareStatement(updateSql)) {
                        psUp.setInt(1, Math.max(0, item.getStockQuantity()));
                        psUp.setBigDecimal(2, item.getPrice());
                        psUp.setBoolean(3, item.getIsAvailable() != null ? item.getIsAvailable() : (item.getStockQuantity() > 0));
                        psUp.setInt(4, item.getLowStockThreshold() != null ? item.getLowStockThreshold() : 10);
                        psUp.setInt(5, existingId);
                        psUp.executeUpdate();
                    }

                    // Audit log
                    int change = item.getStockQuantity() - previousQuantity;
                    insertAuditLog(con, item.getPharmacyId(), item.getMedicineId(), userId, "STOCK_UPDATE",
                            change, previousQuantity, item.getStockQuantity(), "Inventory stock and price adjusted");
                }

                con.commit();
                return item;
            } catch (SQLException ex) {
                con.rollback();
                throw ex;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    public boolean markUnavailable(int inventoryId, int pharmacyId, int userId) throws SQLException {
        try (Connection con = DatabaseConfig.getConnection()) {
            con.setAutoCommit(false);
            try {
                String selectSql = "SELECT medicine_id, stock_quantity FROM pharmacy_inventory WHERE id = ? AND pharmacy_id = ?";
                int medicineId = 0;
                int oldQty = 0;
                try (PreparedStatement psSel = con.prepareStatement(selectSql)) {
                    psSel.setInt(1, inventoryId);
                    psSel.setInt(2, pharmacyId);
                    try (ResultSet rs = psSel.executeQuery()) {
                        if (rs.next()) {
                            medicineId = rs.getInt("medicine_id");
                            oldQty = rs.getInt("stock_quantity");
                        } else {
                            return false;
                        }
                    }
                }

                String updateSql = "UPDATE pharmacy_inventory SET is_available = FALSE, last_stock_update = NOW() WHERE id = ? AND pharmacy_id = ?";
                try (PreparedStatement psUp = con.prepareStatement(updateSql)) {
                    psUp.setInt(1, inventoryId);
                    psUp.setInt(2, pharmacyId);
                    psUp.executeUpdate();
                }

                insertAuditLog(con, pharmacyId, medicineId, userId, "MARK_UNAVAILABLE", 0, oldQty, oldQty, "Manually marked unavailable by pharmacy admin");
                con.commit();
                return true;
            } catch (SQLException ex) {
                con.rollback();
                throw ex;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    private void insertAuditLog(Connection con, int pharmacyId, int medicineId, int userId, String action,
                                int change, int prevQty, int newQty, String details) throws SQLException {
        String sql = "INSERT INTO inventory_audit_logs (pharmacy_id, medicine_id, user_id, action, quantity_change, previous_quantity, new_quantity, details) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, pharmacyId);
            ps.setInt(2, medicineId);
            ps.setInt(3, userId);
            ps.setString(4, action);
            ps.setInt(5, change);
            ps.setInt(6, prevQty);
            ps.setInt(7, newQty);
            ps.setString(8, details);
            ps.executeUpdate();
        }
    }

    private String baseInventorySelect() {
        return "SELECT pi.id, pi.pharmacy_id, pi.medicine_id, pi.stock_quantity, pi.price, pi.is_available, " +
               "pi.low_stock_threshold, pi.last_stock_update, pi.created_at, pi.updated_at, " +
               "m.name AS medicine_name, m.brand_name, m.generic_name, m.strength, m.dosage_form, m.prescription_required, " +
               "p.name AS pharmacy_name, p.phone AS pharmacy_phone, p.address_line1 AS pharmacy_address, p.city AS pharmacy_city, " +
               "p.latitude AS pharmacy_lat, p.longitude AS pharmacy_lng " +
               "FROM pharmacy_inventory pi " +
               "JOIN medicines m ON pi.medicine_id = m.id " +
               "JOIN pharmacies p ON pi.pharmacy_id = p.id";
    }

    private PharmacyInventory mapRowToInventory(ResultSet rs) throws SQLException {
        PharmacyInventory item = new PharmacyInventory();
        item.setId(rs.getInt("id"));
        item.setPharmacyId(rs.getInt("pharmacy_id"));
        item.setMedicineId(rs.getInt("medicine_id"));
        item.setStockQuantity(rs.getInt("stock_quantity"));
        item.setPrice(rs.getBigDecimal("price"));
        item.setIsAvailable(rs.getBoolean("is_available"));
        item.setLowStockThreshold(rs.getInt("low_stock_threshold"));

        Timestamp lastUpdate = rs.getTimestamp("last_stock_update");
        if (lastUpdate != null) item.setLastStockUpdate(lastUpdate.toLocalDateTime());
        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) item.setCreatedAt(created.toLocalDateTime());
        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) item.setUpdatedAt(updated.toLocalDateTime());

        item.setMedicineName(rs.getString("medicine_name"));
        item.setBrandName(rs.getString("brand_name"));
        item.setGenericName(rs.getString("generic_name"));
        item.setStrength(rs.getString("strength"));
        item.setDosageForm(rs.getString("dosage_form"));
        item.setPrescriptionRequired(rs.getBoolean("prescription_required"));

        item.setPharmacyName(rs.getString("pharmacy_name"));
        item.setPharmacyPhone(rs.getString("pharmacy_phone"));
        item.setPharmacyAddress(rs.getString("pharmacy_address"));
        item.setPharmacyCity(rs.getString("pharmacy_city"));

        BigDecimal lat = rs.getBigDecimal("pharmacy_lat");
        if (lat != null) item.setPharmacyLatitude(lat.doubleValue());
        BigDecimal lng = rs.getBigDecimal("pharmacy_lng");
        if (lng != null) item.setPharmacyLongitude(lng.doubleValue());

        return item;
    }
}
