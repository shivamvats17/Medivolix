package com.medivolix.util;

import org.mindrot.jbcrypt.BCrypt;

/**
 * PasswordUtil provides BCrypt password hashing and verification.
 * It automatically normalizes prefix variants ($2b$ to $2a$) for broad compatibility.
 */
public class PasswordUtil {

    private static final int BCRYPT_LOG_ROUNDS = 10;

    public static String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(BCRYPT_LOG_ROUNDS));
    }

    public static boolean checkPassword(String plainPassword, String storedHash) {
        if (plainPassword == null || storedHash == null || storedHash.isEmpty()) {
            return false;
        }

        // Normalize OpenBSD $2b$ or $2y$ prefix to $2a$ for jBCrypt
        String normalizedHash = storedHash;
        if (storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
            normalizedHash = "$2a$" + storedHash.substring(4);
        }

        try {
            return BCrypt.checkpw(plainPassword, normalizedHash);
        } catch (Exception e) {
            System.err.println("[PasswordUtil] Error verifying password: " + e.getMessage());
            return false;
        }
    }
}
