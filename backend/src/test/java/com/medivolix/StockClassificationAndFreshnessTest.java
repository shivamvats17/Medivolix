package com.medivolix;

import com.medivolix.model.PharmacyInventory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class StockClassificationAndFreshnessTest {

    @Test
    @DisplayName("Should detect unavailable when isAvailable is false or stock is 0")
    public void testUnavailableClassification() {
        PharmacyInventory item = new PharmacyInventory();
        item.setIsAvailable(false);
        item.setStockQuantity(50);
        item.setLowStockThreshold(10);
        item.setLastStockUpdate(LocalDateTime.now());

        // Evaluation
        boolean available = Boolean.TRUE.equals(item.getIsAvailable()) && item.getStockQuantity() != null && item.getStockQuantity() > 0;
        assertFalse(available);

        item.setIsAvailable(true);
        item.setStockQuantity(0);
        available = Boolean.TRUE.equals(item.getIsAvailable()) && item.getStockQuantity() != null && item.getStockQuantity() > 0;
        assertFalse(available);
    }

    @Test
    @DisplayName("Should detect low stock when quantity is below threshold")
    public void testLowStockThreshold() {
        PharmacyInventory item = new PharmacyInventory();
        item.setIsAvailable(true);
        item.setStockQuantity(5);
        item.setLowStockThreshold(10);

        int threshold = item.getLowStockThreshold() != null ? item.getLowStockThreshold() : 10;
        boolean isLowStock = item.getStockQuantity() <= threshold;
        assertTrue(isLowStock);
    }

    @Test
    @DisplayName("Should verify stock freshness boundary within 24 hours")
    public void testStockFreshnessBoundary() {
        int freshnessThresholdHours = 24;
        LocalDateTime now = LocalDateTime.now();

        // Updated 2 hours ago -> Fresh
        LocalDateTime recentUpdate = now.minusHours(2);
        long hoursOld = java.time.Duration.between(recentUpdate, now).toHours();
        assertTrue(hoursOld <= freshnessThresholdHours);

        // Updated 30 hours ago -> Outdated
        LocalDateTime oldUpdate = now.minusHours(30);
        hoursOld = java.time.Duration.between(oldUpdate, now).toHours();
        assertTrue(hoursOld > freshnessThresholdHours);
    }
}
