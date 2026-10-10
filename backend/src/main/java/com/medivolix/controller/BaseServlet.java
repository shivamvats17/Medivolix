package com.medivolix.controller;

import com.medivolix.dto.ApiResponse;
import com.medivolix.dto.UserDto;
import com.medivolix.util.JsonUtil;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;

public abstract class BaseServlet extends HttpServlet {

    protected <T> T readJsonBody(HttpServletRequest req, Class<T> clazz) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        String body = sb.toString();
        if (body.trim().isEmpty()) {
            return null;
        }
        return JsonUtil.fromJson(body, clazz);
    }

    protected void sendJson(HttpServletResponse res, int statusCode, Object data) throws IOException {
        res.setStatus(statusCode);
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        ApiResponse<?> response = ApiResponse.ok(data);
        res.getWriter().write(JsonUtil.toJson(response));
    }

    protected void sendJson(HttpServletResponse res, int statusCode, String message, Object data) throws IOException {
        res.setStatus(statusCode);
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        ApiResponse<?> response = ApiResponse.ok(message, data);
        res.getWriter().write(JsonUtil.toJson(response));
    }

    protected void sendError(HttpServletResponse res, int statusCode, String message) throws IOException {
        res.setStatus(statusCode);
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        ApiResponse<?> response = ApiResponse.error(message);
        res.getWriter().write(JsonUtil.toJson(response));
    }

    protected UserDto getAuthenticatedUser(HttpServletRequest req) {
        Object userObj = req.getAttribute("currentUser");
        if (userObj instanceof UserDto) {
            return (UserDto) userObj;
        }
        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("currentUser") != null) {
            return (UserDto) session.getAttribute("currentUser");
        }
        return null;
    }

    protected String[] getPathParts(HttpServletRequest req) {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.trim().isEmpty() || "/".equals(pathInfo)) {
            return new String[0];
        }
        return pathInfo.replaceFirst("^/", "").split("/");
    }

    protected Double getDoubleParam(HttpServletRequest req, String paramName) {
        String val = req.getParameter(paramName);
        if (val == null || val.trim().isEmpty()) return null;
        try {
            return Double.parseDouble(val.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws jakarta.servlet.ServletException, IOException {
        if ("PATCH".equalsIgnoreCase(req.getMethod())) {
            doPatch(req, resp);
        } else {
            super.service(req, resp);
        }
    }

    protected void doPatch(HttpServletRequest req, HttpServletResponse resp) throws jakarta.servlet.ServletException, IOException {
        doPost(req, resp);
    }
}
