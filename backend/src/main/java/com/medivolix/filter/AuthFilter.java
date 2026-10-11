package com.medivolix.filter;

import com.medivolix.dto.ApiResponse;
import com.medivolix.dto.UserDto;
import com.medivolix.model.User;
import com.medivolix.service.AuthService;
import com.medivolix.util.JsonUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

public class AuthFilter implements Filter {

    private final AuthService authService = new AuthService();

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // Skip OPTIONS requests handled by CorsFilter
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String path = req.getRequestURI();
        String contextPath = req.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }

        // Public routes
        if (isPublicRoute(path)) {
            chain.doFilter(request, response);
            return;
        }

        // Resolve authenticated user
        UserDto currentUser = resolveUser(req);
        if (currentUser == null) {
            sendJsonError(res, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required. Please log in.");
            return;
        }

        // Attach current user to request attribute for controllers
        req.setAttribute("currentUser", currentUser);

        // Role-based authorization rules
        if (path.startsWith("/api/admin")) {
            if (!User.Role.SYSTEM_ADMIN.name().equals(currentUser.getRole())) {
                sendJsonError(res, HttpServletResponse.SC_FORBIDDEN, "Access denied. System Administrator role required.");
                return;
            }
        } else if (path.startsWith("/api/pharmacy")) {
            if (!User.Role.PHARMACY_ADMIN.name().equals(currentUser.getRole()) &&
                !User.Role.SYSTEM_ADMIN.name().equals(currentUser.getRole())) {
                sendJsonError(res, HttpServletResponse.SC_FORBIDDEN, "Access denied. Pharmacy Administrator role required.");
                return;
            }
            if (currentUser.getPharmacyId() == null && !User.Role.SYSTEM_ADMIN.name().equals(currentUser.getRole())) {
                sendJsonError(res, HttpServletResponse.SC_FORBIDDEN, "No associated pharmacy found for this administrator account.");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean isPublicRoute(String path) {
        return path.startsWith("/api/auth/login") ||
               path.startsWith("/api/auth/register") ||
               path.startsWith("/api/auth/logout") ||
               path.startsWith("/api/medicines") ||
               path.startsWith("/api/health") ||
               path.startsWith("/api/openapi.json") ||
               path.startsWith("/api/system") ||
               (path.startsWith("/api/pharmacies") && !path.contains("/admin/"));
    }

    private UserDto resolveUser(HttpServletRequest req) {
        // 1. Check HTTP Session
        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("currentUser") != null) {
            return (UserDto) session.getAttribute("currentUser");
        }

        // 2. Check Authorization Header (e.g., Bearer userId for testing/fallback)
        String authHeader = req.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            try {
                int userId = Integer.parseInt(token);
                return authService.getProfile(userId);
            } catch (NumberFormatException ignored) {}
        }

        return null;
    }

    private void sendJsonError(HttpServletResponse res, int status, String message) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        ApiResponse<?> apiResponse = ApiResponse.error(message);
        res.getWriter().write(JsonUtil.toJson(apiResponse));
    }

    @Override
    public void destroy() {}
}
