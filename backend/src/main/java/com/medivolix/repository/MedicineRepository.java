package com.medivolix.repository;

import com.medivolix.config.DatabaseConfig;
import com.medivolix.model.Medicine;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class MedicineRepository {

    public Optional<Medicine> findById(int id) {
        String sql = "SELECT id, name, brand_name, generic_name, strength, dosage_form, manufacturer, " +
                     "prescription_required, description, category, created_at, updated_at " +
                     "FROM medicines WHERE id = ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToMedicine(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[MedicineRepository] Error finding medicine by id: " + e.getMessage());
        }
        return Optional.empty();
    }

    public List<Medicine> findAll() {
        List<Medicine> list = new ArrayList<>();
        String sql = "SELECT id, name, brand_name, generic_name, strength, dosage_form, manufacturer, " +
                     "prescription_required, description, category, created_at, updated_at " +
                     "FROM medicines ORDER BY name ASC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToMedicine(rs));
            }
        } catch (SQLException e) {
            System.err.println("[MedicineRepository] Error finding all medicines: " + e.getMessage());
        }
        return list;
    }

    public List<Medicine> search(String query) {
        List<Medicine> list = new ArrayList<>();
        if (query == null || query.trim().isEmpty()) {
            return findAll();
        }
        String pattern = "%" + query.trim().toLowerCase() + "%";
        String sql = "SELECT id, name, brand_name, generic_name, strength, dosage_form, manufacturer, " +
                     "prescription_required, description, category, created_at, updated_at " +
                     "FROM medicines " +
                     "WHERE LOWER(name) LIKE ? OR LOWER(brand_name) LIKE ? OR LOWER(generic_name) LIKE ? OR LOWER(category) LIKE ? " +
                     "ORDER BY CASE " +
                     "  WHEN LOWER(name) LIKE ? THEN 1 " +
                     "  WHEN LOWER(brand_name) LIKE ? THEN 2 " +
                     "  ELSE 3 END, name ASC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, pattern);
            ps.setString(2, pattern);
            ps.setString(3, pattern);
            ps.setString(4, pattern);
            ps.setString(5, pattern);
            ps.setString(6, pattern);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToMedicine(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[MedicineRepository] Error searching medicines: " + e.getMessage());
        }
        return list;
    }

    private Medicine mapRowToMedicine(ResultSet rs) throws SQLException {
        Medicine m = new Medicine();
        m.setId(rs.getInt("id"));
        m.setName(rs.getString("name"));
        m.setBrandName(rs.getString("brand_name"));
        m.setGenericName(rs.getString("generic_name"));
        m.setStrength(rs.getString("strength"));
        m.setDosageForm(rs.getString("dosage_form"));
        m.setManufacturer(rs.getString("manufacturer"));
        m.setPrescriptionRequired(rs.getBoolean("prescription_required"));
        m.setDescription(rs.getString("description"));
        m.setCategory(rs.getString("category"));

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) m.setCreatedAt(created.toLocalDateTime());
        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) m.setUpdatedAt(updated.toLocalDateTime());
        return m;
    }
}
