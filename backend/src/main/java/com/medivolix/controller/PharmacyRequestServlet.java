package com.medivolix.controller;

import com.medivolix.dto.RequestStatusUpdateRequest;
import com.medivolix.dto.UserDto;
import com.medivolix.model.AvailabilityRequest;
import com.medivolix.service.AvailabilityRequestService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet(name = "PharmacyRequestServlet", urlPatterns = {"/api/pharmacy/requests/*"})
public class PharmacyRequestServlet extends BaseServlet {

    private final AvailabilityRequestService requestService = new AvailabilityRequestService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        UserDto currentUser = getAuthenticatedUser(req);
        if (currentUser == null || currentUser.getPharmacyId() == null) {
            sendError(res, HttpServletResponse.SC_FORBIDDEN, "Pharmacy administrator access required");
            return;
        }

        List<AvailabilityRequest> requests = requestService.getPharmacyRequests(currentUser.getPharmacyId());
        sendJson(res, HttpServletResponse.SC_OK, requests);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        UserDto currentUser = getAuthenticatedUser(req);
        if (currentUser == null || currentUser.getPharmacyId() == null) {
            sendError(res, HttpServletResponse.SC_FORBIDDEN, "Pharmacy administrator access required");
            return;
        }

        String[] parts = getPathParts(req);
        // POST /api/pharmacy/requests/{id}/status
        if (parts.length == 2 && "status".equalsIgnoreCase(parts[1])) {
            try {
                int requestId = Integer.parseInt(parts[0]);
                RequestStatusUpdateRequest statusReq = readJsonBody(req, RequestStatusUpdateRequest.class);
                if (statusReq == null || statusReq.getStatus() == null) {
                    sendError(res, HttpServletResponse.SC_BAD_REQUEST, "New status is required");
                    return;
                }

                boolean updated = requestService.updateStatusByPharmacy(
                        requestId,
                        currentUser.getPharmacyId(),
                        statusReq.getStatus(),
                        statusReq.getNotes()
                );

                if (updated) {
                    sendJson(res, HttpServletResponse.SC_OK, "Request status updated successfully", null);
                } else {
                    sendError(res, HttpServletResponse.SC_BAD_REQUEST, "Could not update request. Ensure request belongs to your pharmacy.");
                }
                return;
            } catch (IllegalArgumentException e) {
                sendError(res, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
                return;
            } catch (Exception e) {
                sendError(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error updating status: " + e.getMessage());
                return;
            }
        }

        sendError(res, HttpServletResponse.SC_NOT_FOUND, "Action not found");
    }
}
