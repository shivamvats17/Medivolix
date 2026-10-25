package com.medivolix.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * DatabaseConfig manages the HikariCP JDBC connection pool.
 * It provides thread-safe, high-performance database connections
 * with automatic recovery and connection leak prevention.
 */
public class DatabaseConfig {

    private static HikariDataSource dataSource;

    public static synchronized void initialize() {
        if (dataSource != null && !dataSource.isClosed()) {
            return;
        }

        try {
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(AppConfig.getDbUrl());
            config.setUsername(AppConfig.getDbUser());
            config.setPassword(AppConfig.getDbPassword());
            config.setDriverClassName(AppConfig.get("db.driver", "com.mysql.cj.jdbc.Driver"));

            config.setMaximumPoolSize(AppConfig.getInt("db.pool.maximumPoolSize", 10));
            config.setMinimumIdle(AppConfig.getInt("db.pool.minimumIdle", 2));
            config.setIdleTimeout(AppConfig.getInt("db.pool.idleTimeout", 30000));
            config.setConnectionTimeout(AppConfig.getInt("db.pool.connectionTimeout", 20000));
            config.setInitializationFailTimeout(-1); // Don't fail container boot; retry connecting in background
            config.setPoolName("MedivolixHikariPool");

            // Recommended MySQL JDBC connection pool properties
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
            config.addDataSourceProperty("useServerPrepStmts", "true");

            dataSource = new HikariDataSource(config);
            System.out.println("[DatabaseConfig] HikariCP Connection Pool initialized successfully.");
        } catch (Exception e) {
            System.err.println("[DatabaseConfig] ERROR: Failed to initialize HikariCP pool: " + e.getMessage());
            throw new RuntimeException("Database pool initialization failed", e);
        }
    }

    public static Connection getConnection() throws SQLException {
        if (dataSource == null || dataSource.isClosed()) {
            initialize();
        }
        return dataSource.getConnection();
    }

    public static synchronized void closeDataSource() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            System.out.println("[DatabaseConfig] HikariCP Connection Pool closed.");
        }
    }
}
