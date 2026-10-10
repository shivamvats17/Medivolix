package com.medivolix.controller;

import com.medivolix.dto.LoginRequest;
import com.medivolix.dto.RegisterRequest;
import com.medivolix.dto.UserDto;
import com.medivolix.service.AuthService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebServlet(name = "AuthServlet", urlPatterns = {"/api/auth/*"})
public class AuthServlet extends BaseServlet {

    private final AuthService authService = new AuthService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String path = req.getPathInfo();
        if ("/me".equals(path)) {
            UserDto user = getAuthenticatedUser(req);
            if (user != null) {
                // Refresh profile to get updated pharmacy bindings or role changes
                UserDto freshProfile = authService.getProfile(user.getId());
                sendJson(res, HttpServletResponse.SC_OK, freshProfile != null ? freshProfile : user);
            } else {
                sendError(res, HttpServletResponse.SC_UNAUTHORIZED, "Not logged in");
            }
        } else {
            sendError(res, HttpServletResponse.SC_NOT_FOUND, "Resource not found");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String path = req.getPathInfo();

        if ("/register".equals(path)) {
            handleRegister(req, res);
        } else if ("/login".equals(path)) {
            handleLogin(req, res);
        } else if ("/logout".equals(path)) {
            handleLogout(req, res);
        } else {
            sendError(res, HttpServletResponse.SC_NOT_FOUND, "Auth action not found");
        }
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            RegisterRequest regReq = readJsonBody(req, RegisterRequest.class);
            UserDto created = authService.register(regReq);

            // Establish session immediately for newly registered customer
            HttpSession session = req.getSession(true);
            session.setAttribute("currentUser", created);

            sendJson(res, HttpServletResponse.SC_CREATED, "Account registered successfully", created);
        } catch (IllegalArgumentException e) {
            sendError(res, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            sendError(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Registration failed: " + e.getMessage());
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            LoginRequest loginReq = readJsonBody(req, LoginRequest.class);
            UserDto user = authService.login(loginReq);

            // Rotate / create session to prevent session fixation
            HttpSession oldSession = req.getSession(false);
            if (oldSession != null) {
                oldSession.invalidate();
            }
            HttpSession session = req.getSession(true);
            session.setAttribute("currentUser", user);

            sendJson(res, HttpServletResponse.SC_OK, "Login successful", user);
        } catch (IllegalArgumentException e) {
            sendError(res, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (SecurityException e) {
            sendError(res, HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
        } catch (Exception e) {
            sendError(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Login processing failed");
        }
    }

    private void handleLogout(HttpServletRequest req, HttpServletResponse res) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        sendJson(res, HttpServletResponse.SC_OK, "Logged out successfully", null);
    }
}
