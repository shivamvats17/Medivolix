package com.medivolix.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * DistanceUtil calculates geographic distances between coordinates
 * using the Haversine formula on a spherical earth model.
 */
public class DistanceUtil {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculates distance in kilometers between two GPS coordinate pairs.
     * Returns null if any coordinate is missing.
     */
    public static Double calculateDistanceKm(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return null;
        }

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double originLat = Math.toRadians(lat1);
        double destLat = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(originLat) * Math.cos(destLat);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = EARTH_RADIUS_KM * c;

        // Round to 1 decimal place (e.g., 2.4 km)
        return BigDecimal.valueOf(distance)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
