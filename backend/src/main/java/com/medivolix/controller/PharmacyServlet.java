package com.medivolix.controller;

import com.medivolix.model.Pharmacy;
import com.medivolix.model.PharmacyInventory;
import com.medivolix.service.PharmacyService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@WebServlet(name = "PharmacyServlet", urlPatterns = {"/api/pharmacies/*"})
public class PharmacyServlet extends BaseServlet {

    private final PharmacyService pharmacyService = new PharmacyService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String[] parts = getPathParts(req);
        Double lat = getDoubleParam(req, "lat");
        Double lng = getDoubleParam(req, "lng");

        // 1. List all approved pharmacies: /api/pharmacies
        if (parts.length == 0) {
            List<Pharmacy> pharmacies = pharmacyService.getApprovedPharmacies(lat, lng);
            sendJson(res, HttpServletResponse.SC_OK, pharmacies);
            return;
        }

        // 2. Pharmacy details: /api/pharmacies/{id}
        if (parts.length == 1) {
            try {
                int id = Integer.parseInt(parts[0]);
                Optional<Pharmacy> pharmacyOpt = pharmacyService.getPharmacyById(id);
                if (pharmacyOpt.isPresent()) {
                    sendJson(res, HttpServletResponse.SC_OK, pharmacyOpt.get());
                } else {
                    sendError(res, HttpServletResponse.SC_NOT_FOUND, "Pharmacy not found");
                }
                return;
            } catch (NumberFormatException ignored) {}
        }

        // 3. Pharmacy inventory / medicines: /api/pharmacies/{id}/medicines
        if (parts.length == 2 && "medicines".equalsIgnoreCase(parts[1])) {
            try {
                int id = Integer.parseInt(parts[0]);
                List<PharmacyInventory> inventory = pharmacyService.getPharmacyInventory(id);
                sendJson(res, HttpServletResponse.SC_OK, inventory);
                return;
            } catch (NumberFormatException ignored) {}
        }

        sendError(res, HttpServletResponse.SC_NOT_FOUND, "Resource not found");
    }
}
