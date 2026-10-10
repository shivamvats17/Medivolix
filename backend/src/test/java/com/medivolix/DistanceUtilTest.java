package com.medivolix;

import com.medivolix.util.DistanceUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class DistanceUtilTest {

    @Test
    @DisplayName("Should return null if any coordinate is missing")
    public void testNullCoordinates() {
        assertNull(DistanceUtil.calculateDistanceKm(null, 77.5946, 12.9716, 77.5946));
        assertNull(DistanceUtil.calculateDistanceKm(12.9716, null, 12.9716, 77.5946));
        assertNull(DistanceUtil.calculateDistanceKm(12.9716, 77.5946, null, 77.5946));
        assertNull(DistanceUtil.calculateDistanceKm(12.9716, 77.5946, 12.9716, null));
    }

    @Test
    @DisplayName("Should return 0.0 for identical coordinates")
    public void testSameCoordinates() {
        Double distance = DistanceUtil.calculateDistanceKm(12.9716, 77.5946, 12.9716, 77.5946);
        assertNotNull(distance);
        assertEquals(0.0, distance, 0.001);
    }

    @Test
    @DisplayName("Should calculate Bangalore Indiranagar to Koramangala distance accurately")
    public void testIndiranagarToKoramangala() {
        // Bangalore Indiranagar (12.9719, 77.6412) to Koramangala (12.9352, 77.6245)
        Double distance = DistanceUtil.calculateDistanceKm(12.9719, 77.6412, 12.9352, 77.6245);
        assertNotNull(distance);
        assertTrue(distance >= 4.0 && distance <= 5.0, "Expected ~4.4 km, actual: " + distance);
    }

    @Test
    @DisplayName("Should calculate inter-city distances correctly")
    public void testDelhiToMumbai() {
        // New Delhi (28.6139, 77.2090) to Mumbai (19.0760, 72.8777) ~1150 km
        Double distance = DistanceUtil.calculateDistanceKm(28.6139, 77.2090, 19.0760, 72.8777);
        assertNotNull(distance);
        assertTrue(distance > 1100.0 && distance < 1200.0, "Expected ~1150 km, actual: " + distance);
    }
}
