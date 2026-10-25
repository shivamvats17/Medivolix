package com.medivolix.config;

import java.io.InputStream;
import java.util.Properties;

/**
 * AppConfig loads system and database settings from environment variables
 * with fallback to application.properties.
 */
public class AppConfig {

    private static final Properties properties = new Properties();

    static {
        try (InputStream is = AppConfig.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (is != null) {
                properties.load(is);
            }
        } catch (Exception e) {
            System.err.println("[AppConfig] Warning: Could not load application.properties: " + e.getMessage());
        }
    }

    public static String get(String key, String defaultValue) {
        // 1. Direct uppercase key (e.g., db.url -> DB_URL, server.port -> SERVER_PORT)
        String envKey = key.replace('.', '_').toUpperCase();
        String envVal = System.getenv(envKey);
        if (envVal != null && !envVal.trim().isEmpty()) {
            return envVal.trim();
        }

        // 2. Snake_case conversion (e.g., cors.allowedOrigins -> CORS_ALLOWED_ORIGINS, app.stockFreshnessHours -> APP_STOCK_FRESHNESS_HOURS)
        String snakeKey = key.replaceAll("([a-z])([A-Z])", "$1_$2").replace('.', '_').toUpperCase();
        envVal = System.getenv(snakeKey);
        if (envVal != null && !envVal.trim().isEmpty()) {
            return envVal.trim();
        }

        // 3. Shortened key without namespace prefix (e.g., app.stockFreshnessHours -> STOCK_FRESHNESS_HOURS)
        if (snakeKey.contains("_")) {
            String shortKey = snakeKey.substring(snakeKey.indexOf('_') + 1);
            envVal = System.getenv(shortKey);
            if (envVal != null && !envVal.trim().isEmpty()) {
                return envVal.trim();
            }
        }

        // 4. Check JVM system properties
        String sysProp = System.getProperty(key);
        if (sysProp != null && !sysProp.trim().isEmpty()) {
            return sysProp.trim();
        }

        // 5. Fallback to loaded properties
        return properties.getProperty(key, defaultValue);
    }

    public static int getInt(String key, int defaultValue) {
        String val = get(key, String.valueOf(defaultValue));
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public static int getPort() {
        return getInt("server.port", 8080);
    }

    public static String getDbUrl() {
        return get("db.url", "jdbc:mysql://localhost:3306/medivolix_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8");
    }

    public static String getDbUser() {
        return get("db.user", "root");
    }

    public static String getDbPassword() {
        return get("db.password", "shiv@17sql");
    }

    public static String[] getAllowedOrigins() {
        String raw = get("cors.allowedOrigins", "http://localhost:5173,http://127.0.0.1:5173");
        return raw.split(",");
    }

    public static int getStockFreshnessHours() {
        return getInt("app.stockFreshnessHours", 24);
    }

    public static int getLowStockThreshold() {
        return getInt("app.lowStockThreshold", 10);
    }

    public static int getExpiryWarningDays() {
        return getInt("app.expiryWarningDays", 45);
    }
}
