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
        // First check System environment variables (e.g., DB_URL for db.url)
        String envKey = key.replace('.', '_').toUpperCase();
        String envVal = System.getenv(envKey);
        if (envVal != null && !envVal.trim().isEmpty()) {
            return envVal.trim();
        }

        // Then check JVM system properties
        String sysProp = System.getProperty(key);
        if (sysProp != null && !sysProp.trim().isEmpty()) {
            return sysProp.trim();
        }

        // Fallback to loaded properties
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
