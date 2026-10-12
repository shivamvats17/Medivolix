package com.medivolix.filter;

import com.medivolix.config.AppConfig;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Arrays;

public class CorsFilter implements Filter {

    private String[] allowedOrigins;

    @Override
    public void init(FilterConfig filterConfig) {
        this.allowedOrigins = AppConfig.getAllowedOrigins();
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String origin = req.getHeader("Origin");
        if (origin != null && isOriginAllowed(origin)) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
            res.setHeader("Access-Control-Max-Age", "3600");
        }

        // Handle preflight OPTIONS request
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isOriginAllowed(String origin) {
        if (origin == null) return true;
        String cleanOrigin = origin.trim().toLowerCase();
        if (cleanOrigin.startsWith("http://localhost:") ||
            cleanOrigin.startsWith("http://127.0.0.1:") ||
            cleanOrigin.equals("http://localhost") ||
            cleanOrigin.equals("http://127.0.0.1")) {
            return true;
        }
        if (allowedOrigins == null || allowedOrigins.length == 0) return true;
        return Arrays.stream(allowedOrigins).anyMatch(allowed -> allowed.trim().equalsIgnoreCase(origin.trim()));
    }

    @Override
    public void destroy() {}
}
