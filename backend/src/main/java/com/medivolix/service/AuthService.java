package com.medivolix.service;

import com.medivolix.dto.LoginRequest;
import com.medivolix.dto.RegisterRequest;
import com.medivolix.dto.UserDto;
import com.medivolix.model.Pharmacy;
import com.medivolix.model.User;
import com.medivolix.repository.PharmacyRepository;
import com.medivolix.repository.UserRepository;
import com.medivolix.util.PasswordUtil;
import com.medivolix.util.ValidationUtil;

import java.sql.SQLException;
import java.util.Optional;

public class AuthService {

    private final UserRepository userRepository = new UserRepository();
    private final PharmacyRepository pharmacyRepository = new PharmacyRepository();

    public UserDto register(RegisterRequest req) throws IllegalArgumentException, SQLException {
        if (req == null) {
            throw new IllegalArgumentException("Registration data cannot be empty");
        }
        if (!ValidationUtil.isValidEmail(req.getEmail())) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (ValidationUtil.isBlank(req.getPassword()) || req.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }
        if (ValidationUtil.isBlank(req.getFullName())) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (!ValidationUtil.isValidPhone(req.getPhone())) {
            throw new IllegalArgumentException("Invalid phone number format");
        }

        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        // Public registration strictly assigns CUSTOMER role
        User user = new User();
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPasswordHash(PasswordUtil.hashPassword(req.getPassword()));
        user.setFullName(req.getFullName().trim());
        user.setPhone(req.getPhone().trim());
        user.setRole(User.Role.CUSTOMER);
        user.setStatus(User.Status.ACTIVE);

        User created = userRepository.create(user);
        return new UserDto(created);
    }

    public UserDto login(LoginRequest req) throws IllegalArgumentException, SecurityException {
        if (req == null || ValidationUtil.isBlank(req.getEmail()) || ValidationUtil.isBlank(req.getPassword())) {
            throw new IllegalArgumentException("Email and password are required");
        }

        Optional<User> userOpt = userRepository.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) {
            throw new SecurityException("Invalid email or password");
        }

        User user = userOpt.get();
        if (!PasswordUtil.checkPassword(req.getPassword(), user.getPasswordHash())) {
            throw new SecurityException("Invalid email or password");
        }

        if (user.getStatus() != User.Status.ACTIVE) {
            throw new SecurityException("Account is " + user.getStatus().name().toLowerCase() + ". Please contact administrator.");
        }

        UserDto dto = new UserDto(user);

        // If user is a PHARMACY_ADMIN, attach associated pharmacy
        if (user.getRole() == User.Role.PHARMACY_ADMIN) {
            Optional<Pharmacy> pharmacyOpt = pharmacyRepository.findByAdminUserId(user.getId());
            if (pharmacyOpt.isPresent()) {
                Pharmacy p = pharmacyOpt.get();
                dto.setPharmacyId(p.getId());
                dto.setPharmacyName(p.getName());
            }
        }

        return dto;
    }

    public UserDto getProfile(int userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return null;
        }
        User user = userOpt.get();
        UserDto dto = new UserDto(user);
        if (user.getRole() == User.Role.PHARMACY_ADMIN) {
            Optional<Pharmacy> pharmacyOpt = pharmacyRepository.findByAdminUserId(user.getId());
            if (pharmacyOpt.isPresent()) {
                Pharmacy p = pharmacyOpt.get();
                dto.setPharmacyId(p.getId());
                dto.setPharmacyName(p.getName());
            }
        }
        return dto;
    }
}
