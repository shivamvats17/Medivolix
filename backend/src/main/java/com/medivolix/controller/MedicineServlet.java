package com.medivolix.controller;

import com.medivolix.dto.MedicineSearchResultDto;
import com.medivolix.model.Medicine;
import com.medivolix.service.MedicineService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet(name = "MedicineServlet", urlPatterns = {"/api/medicines/*", "/api/medicines", "/medicines/*", "/medicines"})
public class MedicineServlet extends BaseServlet {

    private final MedicineService medicineService = new MedicineService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String path = req.getPathInfo();
        String[] parts = getPathParts(req);
        Double lat = getDoubleParam(req, "lat");
        Double lng = getDoubleParam(req, "lng");

        String query = req.getParameter("q");
        if (query == null) {
            query = req.getParameter("query");
        }

        // 1. Search endpoint: /api/medicines/search, /medicines/search, trailing slashes, or query match
        boolean isSearchPath = (parts.length > 0 && "search".equalsIgnoreCase(parts[0]))
                || (path != null && (path.equals("/search") || path.startsWith("/search/")));

        if (isSearchPath) {
            List<MedicineSearchResultDto> results = medicineService.search(query, lat, lng);
            sendJson(res, HttpServletResponse.SC_OK, results);
            return;
        }

        // 2. Specific medicine details: /api/medicines/{id}
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

        // 3. Catalog listing or query search fallback: /api/medicines, /api/medicines/, etc.
        if (parts.length == 0 || path == null || "/".equals(path) || path.isEmpty()) {
            if (query != null && !query.trim().isEmpty()) {
                List<MedicineSearchResultDto> results = medicineService.search(query, lat, lng);
                sendJson(res, HttpServletResponse.SC_OK, results);
            } else {
                List<Medicine> all = medicineService.getAllMedicines();
                sendJson(res, HttpServletResponse.SC_OK, all);
            }
            return;
        }

        sendError(res, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
    }
}
