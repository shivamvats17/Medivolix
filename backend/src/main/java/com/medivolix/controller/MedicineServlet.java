package com.medivolix.controller;

import com.medivolix.dto.MedicineSearchResultDto;
import com.medivolix.model.Medicine;
import com.medivolix.service.MedicineService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet(name = "MedicineServlet", urlPatterns = {"/api/medicines/*"})
public class MedicineServlet extends BaseServlet {

    private final MedicineService medicineService = new MedicineService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String path = req.getPathInfo();
        Double lat = getDoubleParam(req, "lat");
        Double lng = getDoubleParam(req, "lng");

        // 1. Search endpoint: /api/medicines/search?q={query}
        if ("/search".equals(path)) {
            String query = req.getParameter("q");
            List<MedicineSearchResultDto> results = medicineService.search(query, lat, lng);
            sendJson(res, HttpServletResponse.SC_OK, results);
            return;
        }

        // 2. Specific medicine details: /api/medicines/{id}
        String[] parts = getPathParts(req);
        if (parts.length == 1) {
            try {
                int medId = Integer.parseInt(parts[0]);
                MedicineSearchResultDto dto = medicineService.getMedicineDetails(medId, lat, lng);
                if (dto != null) {
                    sendJson(res, HttpServletResponse.SC_OK, dto);
                } else {
                    sendError(res, HttpServletResponse.SC_NOT_FOUND, "Medicine not found");
                }
                return;
            } catch (NumberFormatException ignored) {}
        }

        // 3. Catalog listing: /api/medicines or /api/medicines/
        if (path == null || "/".equals(path) || path.isEmpty()) {
            List<Medicine> all = medicineService.getAllMedicines();
            sendJson(res, HttpServletResponse.SC_OK, all);
            return;
        }

        sendError(res, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
    }
}
