package com.medivolix.controller;

import com.medivolix.dto.AdminOverviewDto;
import com.medivolix.dto.UserDto;
import com.medivolix.model.Pharmacy;
import com.medivolix.service.AdminService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet(name = "AdminServlet", urlPatterns = {"/api/admin/*"})
public class AdminServlet extends BaseServlet {

    private final AdminService adminService = new AdminService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String path = req.getPathInfo();
        String[] parts = getPathParts(req);

        // 1. Overview metrics: /api/admin/overview
        if ("/overview".equals(path) || (parts.length == 1 && "overview".equals(parts[0]))) {
            AdminOverviewDto overview = adminService.getOverview();
            sendJson(res, HttpServletResponse.SC_OK, overview);
            return;
        }

        // 2. Users list: /api/admin/users
        if ("/users".equals(path) || (parts.length == 1 && "users".equals(parts[0]))) {
            List<UserDto> users = adminService.getAllUsers();
            sendJson(res, HttpServletResponse.SC_OK, users);
            return;
        }

        // 3. Pharmacies list: /api/admin/pharmacies
        if ("/pharmacies".equals(path) || (parts.length == 1 && "pharmacies".equals(parts[0]))) {
            List<Pharmacy> pharmacies = adminService.getAllPharmacies();
            sendJson(res, HttpServletResponse.SC_OK, pharmacies);
            return;
        }

        sendError(res, HttpServletResponse.SC_NOT_FOUND, "Admin endpoint not found");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String[] parts = getPathParts(req);

        // POST /api/admin/pharmacies/{id}/approve
        if (parts.length == 3 && "pharmacies".equalsIgnoreCase(parts[0]) && "approve".equalsIgnoreCase(parts[2])) {
            try {
                int pharmacyId = Integer.parseInt(parts[1]);
                boolean ok = adminService.approvePharmacy(pharmacyId);
                if (ok) {
                    sendJson(res, HttpServletResponse.SC_OK, "Pharmacy approved successfully", null);
                } else {
                    sendError(res, HttpServletResponse.SC_BAD_REQUEST, "Could not approve pharmacy");
                }
                return;
            } catch (NumberFormatException ignored) {}
        }

        // POST /api/admin/pharmacies/{id}/suspend
        if (parts.length == 3 && "pharmacies".equalsIgnoreCase(parts[0]) && "suspend".equalsIgnoreCase(parts[2])) {
            try {
                int pharmacyId = Integer.parseInt(parts[1]);
                boolean ok = adminService.suspendPharmacy(pharmacyId);
                if (ok) {
                    sendJson(res, HttpServletResponse.SC_OK, "Pharmacy suspended successfully", null);
                } else {
                    sendError(res, HttpServletResponse.SC_BAD_REQUEST, "Could not suspend pharmacy");
                }
                return;
            } catch (NumberFormatException ignored) {}
        }

        sendError(res, HttpServletResponse.SC_NOT_FOUND, "Admin action not found");
    }
}
