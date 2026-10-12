package com.medivolix;

import com.medivolix.config.AppConfig;
import com.medivolix.config.DatabaseConfig;
import com.medivolix.controller.*;
import com.medivolix.filter.AuthFilter;
import com.medivolix.filter.CorsFilter;
import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;
import org.apache.tomcat.util.descriptor.web.FilterDef;
import org.apache.tomcat.util.descriptor.web.FilterMap;

import java.io.File;

/**
 * MainApplication provides an embedded Apache Tomcat 10.1 launcher.
 * It programmatically registers all Jakarta Servlets and Filters,
 * enabling immediate zero-configuration execution from VS Code or CLI.
 */
public class MainApplication {

    public static void main(String[] args) throws Exception {
        int port = AppConfig.getPort();

        // 1. Initialize Database Connection Pool
        DatabaseConfig.initialize();

        Tomcat tomcat = new Tomcat();
        tomcat.setPort(port);
        tomcat.getConnector(); // Initialize default HTTP NIO connector

        String baseDir = new File(System.getProperty("java.io.tmpdir"), "medivolix-tomcat-" + port).getAbsolutePath();
        tomcat.setBaseDir(baseDir);

        // Create standard root web context and set parent class loader
        Context ctx = tomcat.addContext("", new File(".").getAbsolutePath());
        ctx.setParentClassLoader(MainApplication.class.getClassLoader());

        // 2. Register CORS Filter
        FilterDef corsDef = new FilterDef();
        corsDef.setFilterName("CorsFilter");
        corsDef.setFilterClass(CorsFilter.class.getName());
        ctx.addFilterDef(corsDef);

        FilterMap corsMap = new FilterMap();
        corsMap.setFilterName("CorsFilter");
        corsMap.addURLPattern("/*");
        ctx.addFilterMap(corsMap);

        // 3. Register Auth Filter
        FilterDef authDef = new FilterDef();
        authDef.setFilterName("AuthFilter");
        authDef.setFilterClass(AuthFilter.class.getName());
        ctx.addFilterDef(authDef);

        FilterMap authMap = new FilterMap();
        authMap.setFilterName("AuthFilter");
        authMap.addURLPattern("/*");
        ctx.addFilterMap(authMap);

        // 4. Register Jakarta Servlets
        Tomcat.addServlet(ctx, "AuthServlet", new AuthServlet());
        ctx.addServletMappingDecoded("/api/auth/*", "AuthServlet");

        Tomcat.addServlet(ctx, "MedicineServlet", new MedicineServlet());
        ctx.addServletMappingDecoded("/api/medicines/*", "MedicineServlet");

        Tomcat.addServlet(ctx, "PharmacyServlet", new PharmacyServlet());
        ctx.addServletMappingDecoded("/api/pharmacies/*", "PharmacyServlet");

        Tomcat.addServlet(ctx, "AvailabilityRequestServlet", new AvailabilityRequestServlet());
        ctx.addServletMappingDecoded("/api/availability-requests/*", "AvailabilityRequestServlet");

        Tomcat.addServlet(ctx, "PharmacyInventoryServlet", new PharmacyInventoryServlet());
        ctx.addServletMappingDecoded("/api/pharmacy/inventory/*", "PharmacyInventoryServlet");

        Tomcat.addServlet(ctx, "PharmacyRequestServlet", new PharmacyRequestServlet());
        ctx.addServletMappingDecoded("/api/pharmacy/requests/*", "PharmacyRequestServlet");

        Tomcat.addServlet(ctx, "AdminServlet", new AdminServlet());
        ctx.addServletMappingDecoded("/api/admin/*", "AdminServlet");

        Tomcat.addServlet(ctx, "SystemServlet", new SystemServlet());
        ctx.addServletMappingDecoded("/api/health", "SystemServlet");
        ctx.addServletMappingDecoded("/api/openapi.json", "SystemServlet");
        ctx.addServletMappingDecoded("/api/system/*", "SystemServlet");

        System.out.println("===============================================================");
        System.out.println("  MEDIVOLIX BACKEND SERVER (Apache Tomcat 10.1 / Jakarta Servlets)");
        System.out.println("===============================================================");
        System.out.println("  Server running on http://localhost:" + port);
        System.out.println("  API Root URL     : http://localhost:" + port + "/api");
        System.out.println("  Database URL     : " + AppConfig.getDbUrl());
        System.out.println("===============================================================");

        tomcat.start();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                System.out.println("\n[Tomcat] Shutting down Medivolix server...");
                tomcat.stop();
                tomcat.destroy();
                DatabaseConfig.closeDataSource();
            } catch (Exception ignored) {}
        }));

        tomcat.getServer().await();
    }
}
