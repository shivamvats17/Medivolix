package com.medivolix.controller;

import com.medivolix.config.DatabaseConfig;
import com.medivolix.dto.ApiResponse;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * SystemServlet handles platform diagnostic health checks and
 * serves the OpenAPI 3.0 specification definition.
 */
@WebServlet(name = "SystemServlet", urlPatterns = {"/api/health", "/api/openapi.json", "/api/system/*"})
public class SystemServlet extends BaseServlet {

    private static String cachedOpenApiJson = null;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String servletPath = req.getServletPath();
        String pathInfo = req.getPathInfo();

        if ("/api/openapi.json".equals(servletPath) || "/openapi.json".equals(pathInfo)) {
            handleOpenApiSpec(res);
            return;
        }

        if ("/api/health".equals(servletPath) || "/health".equals(pathInfo) || "/api/system".equals(servletPath)) {
            handleHealthCheck(res);
            return;
        }

        sendError(res, HttpServletResponse.SC_NOT_FOUND, "System endpoint not found");
    }

    private void handleHealthCheck(HttpServletResponse res) throws IOException {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("timestamp", Instant.now().toEpochMilli());

        // 1. Database Connectivity Diagnostics (Bounded to 1.5s so health checks never hang)
        Map<String, Object> dbData = new HashMap<>();
        boolean dbHealthy = false;
        String dbError = null;

        java.util.concurrent.CompletableFuture<Map<String, Object>> dbCheckFuture = 
            java.util.concurrent.CompletableFuture.supplyAsync(() -> {
                Map<String, Object> data = new HashMap<>();
                long start = System.currentTimeMillis();
                try (Connection conn = DatabaseConfig.getConnection()) {
                    boolean healthy = conn.isValid(1);
                    long latency = System.currentTimeMillis() - start;
                    data.put("status", healthy ? "UP" : "DOWN");
                    data.put("latencyMs", latency);
                    data.put("poolName", "MedivolixHikariPool");
                    data.put("databaseProduct", conn.getMetaData().getDatabaseProductName());
                    data.put("healthy", healthy);
                } catch (Exception e) {
                    data.put("status", "DOWN");
                    data.put("error", e.getMessage());
                    data.put("healthy", false);
                }
                return data;
            });

        try {
            dbData = dbCheckFuture.get(1500, java.util.concurrent.TimeUnit.MILLISECONDS);
            dbHealthy = Boolean.TRUE.equals(dbData.get("healthy"));
            dbError = (String) dbData.get("error");
        } catch (java.util.concurrent.TimeoutException te) {
            dbData.put("status", "DOWN");
            dbData.put("error", "Database connection probe timed out (>1500ms)");
            dbCheckFuture.cancel(true);
            dbHealthy = false;
            dbError = "Connection probe timed out";
        } catch (Exception e) {
            dbData.put("status", "DOWN");
            dbData.put("error", e.getMessage());
            dbHealthy = false;
            dbError = e.getMessage();
        }
        healthData.put("database", dbData);

        // 2. JVM & System Runtime Metrics
        Runtime rt = Runtime.getRuntime();
        Map<String, Object> sysData = new HashMap<>();
        sysData.put("javaVersion", System.getProperty("java.version"));
        sysData.put("javaVendor", System.getProperty("java.vendor"));
        sysData.put("osName", System.getProperty("os.name"));
        sysData.put("availableProcessors", rt.availableProcessors());
        sysData.put("totalMemoryMb", rt.totalMemory() / (1024 * 1024));
        sysData.put("freeMemoryMb", rt.freeMemory() / (1024 * 1024));
        sysData.put("maxMemoryMb", rt.maxMemory() / (1024 * 1024));
        healthData.put("system", sysData);

        if (dbHealthy) {
            sendJson(res, HttpServletResponse.SC_OK, "System is fully operational", healthData);
        } else {
            sendJson(res, HttpServletResponse.SC_OK, "System is online (Database degraded: " + dbError + ")", healthData);
        }
    }

    private void handleOpenApiSpec(HttpServletResponse res) throws IOException {
        if (cachedOpenApiJson == null) {
            synchronized (SystemServlet.class) {
                if (cachedOpenApiJson == null) {
                    try (InputStream is = getClass().getClassLoader().getResourceAsStream("openapi.json")) {
                        if (is != null) {
                            StringBuilder sb = new StringBuilder();
                            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                                String line;
                                while ((line = reader.readLine()) != null) {
                                    sb.append(line).append("\n");
                                }
                            }
                            cachedOpenApiJson = sb.toString();
                        }
                    } catch (Exception e) {
                        System.err.println("[SystemServlet] Failed to load openapi.json from classpath: " + e.getMessage());
                    }
                }
            }
        }

        if (cachedOpenApiJson != null) {
            res.setStatus(HttpServletResponse.SC_OK);
            res.setContentType("application/json");
            res.setCharacterEncoding("UTF-8");
            res.getWriter().write(cachedOpenApiJson);
        } else {
            sendError(res, HttpServletResponse.SC_NOT_FOUND, "OpenAPI specification document not found");
        }
    }
}
