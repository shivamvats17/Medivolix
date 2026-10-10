package com.medivolix.listener;

import com.medivolix.config.DatabaseConfig;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class AppContextListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("[AppContextListener] Initializing Medivolix application...");
        try {
            DatabaseConfig.initialize();
            System.out.println("[AppContextListener] Database pool initialized.");
        } catch (Exception e) {
            System.err.println("[AppContextListener] CRITICAL: Database initialization failed: " + e.getMessage());
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("[AppContextListener] Shutting down Medivolix application...");
        DatabaseConfig.closeDataSource();
    }
}
