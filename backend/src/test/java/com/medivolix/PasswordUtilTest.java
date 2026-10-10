package com.medivolix;

import com.medivolix.util.DistanceUtil;
import com.medivolix.util.PasswordUtil;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PasswordUtilTest {

    @Test
    public void testHashAndVerifyPassword() {
        String raw = "SecurePassword123";
        String hash = PasswordUtil.hashPassword(raw);

        assertNotNull(hash);
        assertTrue(hash.startsWith("$2a$") || hash.startsWith("$2b$"));
        assertTrue(PasswordUtil.checkPassword(raw, hash));
        assertFalse(PasswordUtil.checkPassword("WrongPassword", hash));
    }

    @Test
    public void testDistanceCalculation() {
        // Bangalore Indiranagar (12.9719, 77.6412) to Koramangala (12.9352, 77.6245)
        Double distance = DistanceUtil.calculateDistanceKm(12.9719, 77.6412, 12.9352, 77.6245);
        assertNotNull(distance);
        assertTrue(distance > 3.0 && distance < 6.0, "Distance should be approx 4.4 km, got: " + distance);
    }
}
