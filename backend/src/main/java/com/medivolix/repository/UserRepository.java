package com.medivolix.repository;

import com.medivolix.config.DatabaseConfig;
import com.medivolix.model.User;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class UserRepository {

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT id, email, password_hash, full_name, phone, role, status, created_at, updated_at " +
                     "FROM users WHERE LOWER(email) = LOWER(?)";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, email.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToUser(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[UserRepository] Error finding user by email: " + e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<User> findById(int id) {
        String sql = "SELECT id, email, password_hash, full_name, phone, role, status, created_at, updated_at " +
                     "FROM users WHERE id = ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToUser(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[UserRepository] Error finding user by id: " + e.getMessage());
        }
        return Optional.empty();
    }

    public User create(User user) throws SQLException {
        String sql = "INSERT INTO users (email, password_hash, full_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, user.getEmail().trim().toLowerCase());
            ps.setString(2, user.getPasswordHash());
            ps.setString(3, user.getFullName().trim());
            ps.setString(4, user.getPhone().trim());
            ps.setString(5, user.getRole().name());
            ps.setString(6, user.getStatus().name());

            int affected = ps.executeUpdate();
            if (affected == 0) {
                throw new SQLException("Creating user failed, no rows affected.");
            }

            try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    user.setId(generatedKeys.getInt(1));
                } else {
                    throw new SQLException("Creating user failed, no ID obtained.");
                }
            }
            return user;
        }
    }

    public List<User> findAll() {
        List<User> list = new ArrayList<>();
        String sql = "SELECT id, email, password_hash, full_name, phone, role, status, created_at, updated_at " +
                     "FROM users ORDER BY created_at DESC";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToUser(rs));
            }
        } catch (SQLException e) {
            System.err.println("[UserRepository] Error listing users: " + e.getMessage());
        }
        return list;
    }

    public boolean updateStatus(int userId, User.Status status) {
        String sql = "UPDATE users SET status = ? WHERE id = ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[UserRepository] Error updating user status: " + e.getMessage());
            return false;
        }
    }

    public boolean updateProfile(int userId, String fullName, String phone) {
        String sql = "UPDATE users SET full_name = ?, phone = ?, updated_at = NOW() WHERE id = ?";
        try (Connection con = DatabaseConfig.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, fullName.trim());
            ps.setString(2, phone != null ? phone.trim() : "");
            ps.setInt(3, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[UserRepository] Error updating user profile: " + e.getMessage());
            return false;
        }
    }


    private User mapRowToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getInt("id"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setFullName(rs.getString("full_name"));
        user.setPhone(rs.getString("phone"));
        user.setRole(User.Role.valueOf(rs.getString("role")));
        user.setStatus(User.Status.valueOf(rs.getString("status")));
        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) user.setCreatedAt(created.toLocalDateTime());
        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) user.setUpdatedAt(updated.toLocalDateTime());
        return user;
    }
}
