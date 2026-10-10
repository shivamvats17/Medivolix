package com.medivolix.controller;

import com.medivolix.dto.CreateAvailabilityRequestDto;
import com.medivolix.dto.UserDto;
import com.medivolix.model.AvailabilityRequest;
import com.medivolix.service.AvailabilityRequestService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@WebServlet(name = "AvailabilityRequestServlet", urlPatterns = {"/api/availability-requests/*"})
public class AvailabilityRequestServlet extends BaseServlet {

    private final AvailabilityRequestService requestService = new AvailabilityRequestService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        UserDto currentUser = getAuthenticatedUser(req);
        if (currentUser == null) {
            sendError(res, HttpServletResponse.SC_UNAUTHORIZED, "Please log in");
            return;
        }

        String path = req.getPathInfo();
        String[] parts = getPathParts(req);

        // 1. My requests: /api/availability-requests/my
        if ("/my".equals(path) || (parts.length == 1 && "my".equals(parts[0]))) {
            List<AvailabilityRequest> requests = requestService.getCustomerRequests(currentUser.getId());
            sendJson(res, HttpServletResponse.SC_OK, requests);
            return;
        }

        // 2. Specific request: /api/availability-requests/{id}
        if (parts.length == 1) {
            try {
                int id = Integer.parseInt(parts[0]);
                Optional<AvailabilityRequest> reqOpt = requestService.getRequestById(id);
                if (reqOpt.isPresent()) {
                    AvailabilityRequest r = reqOpt.get();
                    // Customer can only view their own request unless admin/pharmacy
                    if (!r.getCustomerId().equals(currentUser.getId()) &&
                        !"SYSTEM_ADMIN".equals(currentUser.getRole()) &&
                        !r.getPharmacyId().equals(currentUser.getPharmacyId())) {
                        sendError(res, HttpServletResponse.SC_FORBIDDEN, "Access denied to this request");
                        return;
                    }
                    sendJson(res, HttpServletResponse.SC_OK, r);
                } else {
                    sendError(res, HttpServletResponse.SC_NOT_FOUND, "Request not found");
                }
                return;
            } catch (NumberFormatException ignored) {}
        }

        sendError(res, HttpServletResponse.SC_NOT_FOUND, "Resource not found");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        UserDto currentUser = getAuthenticatedUser(req);
        if (currentUser == null) {
            sendError(res, HttpServletResponse.SC_UNAUTHORIZED, "Please log in");
            return;
        }

        String path = req.getPathInfo();
        String[] parts = getPathParts(req);

        // 1. Submit availability request: POST /api/availability-requests or /
        if (path == null || "/".equals(path) || path.isEmpty()) {
            try {
                CreateAvailabilityRequestDto dto = readJsonBody(req, CreateAvailabilityRequestDto.class);
                AvailabilityRequest created = requestService.createRequest(currentUser.getId(), dto);
                sendJson(res, HttpServletResponse.SC_CREATED, "Availability request submitted", created);
            } catch (IllegalArgumentException e) {
                sendError(res, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
            } catch (Exception e) {
                sendError(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to submit request: " + e.getMessage());
            }
            return;
        }

        // 2. Cancel request: POST /api/availability-requests/{id}/cancel
        if (parts.length == 2 && "cancel".equalsIgnoreCase(parts[1])) {
            try {
                int id = Integer.parseInt(parts[0]);
                boolean cancelled = requestService.cancelByCustomer(id, currentUser.getId());
                if (cancelled) {
                    sendJson(res, HttpServletResponse.SC_OK, "Request cancelled successfully", null);
                } else {
                    sendError(res, HttpServletResponse.SC_BAD_REQUEST, "Could not cancel request. It may not exist, may not be yours, or is no longer pending.");
                }
                return;
            } catch (NumberFormatException ignored) {}
        }

        sendError(res, HttpServletResponse.SC_NOT_FOUND, "Action not found");
    }
}
