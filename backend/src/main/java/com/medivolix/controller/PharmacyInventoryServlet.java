package com.medivolix.controller;

import com.medivolix.dto.BatchRequest;
import com.medivolix.dto.InventoryItemRequest;
import com.medivolix.dto.UserDto;
import com.medivolix.model.InventoryAuditLog;
import com.medivolix.model.InventoryBatch;
import com.medivolix.model.PharmacyInventory;
import com.medivolix.service.InventoryService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet(name = "PharmacyInventoryServlet", urlPatterns = {"/api/pharmacy/inventory/*"})
public class PharmacyInventoryServlet extends BaseServlet {

    private final InventoryService inventoryService = new InventoryService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        UserDto currentUser = getAuthenticatedUser(req);
        if (currentUser == null || currentUser.getPharmacyId() == null) {
            sendError(res, HttpServletResponse.SC_FORBIDDEN, "Pharmacy administrator access required");
            return;
        }

        int pharmacyId = currentUser.getPharmacyId();
        String path = req.getPathInfo();
        String[] parts = getPathParts(req);

        // 1. Low-stock: /api/pharmacy/inventory/low-stock
        if ("/low-stock".equals(path) || (parts.length == 1 && "low-stock".equals(parts[0]))) {
            List<PharmacyInventory> lowStock = inventoryService.getLowStockItems(pharmacyId);
            sendJson(res, HttpServletResponse.SC_OK, lowStock);
            return;
        }

        // 2. Approaching expiry: /api/pharmacy/inventory/expiry
        if ("/expiry".equals(path) || (parts.length == 1 && "expiry".equals(parts[0]))) {
            List<InventoryBatch> expiring = inventoryService.getApproachingExpiry(pharmacyId);
            sendJson(res, HttpServletResponse.SC_OK, expiring);
            return;
        }

        // 3. Audit trail: /api/pharmacy/inventory/audit
        if ("/audit".equals(path) || (parts.length == 1 && "audit".equals(parts[0]))) {
            List<InventoryAuditLog> logs = inventoryService.getAuditLogs(pharmacyId, 50);
            sendJson(res, HttpServletResponse.SC_OK, logs);
            return;
        }

        // 4. Default: list all inventory items for this pharmacy
        if (path == null || "/".equals(path) || path.isEmpty()) {
            List<PharmacyInventory> inventory = inventoryService.getPharmacyInventory(pharmacyId);
            sendJson(res, HttpServletResponse.SC_OK, inventory);
            return;
        }

        sendError(res, HttpServletResponse.SC_NOT_FOUND, "Inventory endpoint not found");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        UserDto currentUser = getAuthenticatedUser(req);
        if (currentUser == null || currentUser.getPharmacyId() == null) {
            sendError(res, HttpServletResponse.SC_FORBIDDEN, "Pharmacy administrator access required");
            return;
        }

        int pharmacyId = currentUser.getPharmacyId();
        String path = req.getPathInfo();
        String[] parts = getPathParts(req);

        // 1. Mark item unavailable: /api/pharmacy/inventory/{id}/unavailable
        if (parts.length == 2 && "unavailable".equalsIgnoreCase(parts[1])) {
            try {
                int invId = Integer.parseInt(parts[0]);
                boolean marked = inventoryService.markUnavailable(invId, pharmacyId, currentUser.getId());
                if (marked) {
                    sendJson(res, HttpServletResponse.SC_OK, "Item marked unavailable", null);
                } else {
                    sendError(res, HttpServletResponse.SC_BAD_REQUEST, "Item not found or does not belong to your pharmacy");
                }
                return;
            } catch (NumberFormatException ignored) {}
            catch (Exception e) {
                sendError(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
                return;
            }
        }

        // 2. Add batch: /api/pharmacy/inventory/batch
        if ("/batch".equals(path) || (parts.length == 1 && "batch".equals(parts[0]))) {
            try {
                BatchRequest bReq = readJsonBody(req, BatchRequest.class);
                InventoryBatch batch = inventoryService.addBatch(pharmacyId, bReq);
                sendJson(res, HttpServletResponse.SC_CREATED, "Batch recorded successfully", batch);
            } catch (IllegalArgumentException | SecurityException e) {
                sendError(res, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
            } catch (Exception e) {
                sendError(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to record batch: " + e.getMessage());
            }
            return;
        }

        // 3. Add or update inventory item: POST /api/pharmacy/inventory OR PUT /api/pharmacy/inventory/{id}
        boolean isItemUpdate = (path == null || "/".equals(path) || path.isEmpty()) ||
                (parts.length == 1 && !parts[0].equals("batch") && !parts[0].equals("low-stock") && !parts[0].equals("expiry") && !parts[0].equals("audit"));

        if (isItemUpdate) {
            try {
                InventoryItemRequest itemReq = readJsonBody(req, InventoryItemRequest.class);
                if (itemReq != null && parts.length == 1) {
                    try {
                        int pathInvId = Integer.parseInt(parts[0]);
                        if (itemReq.getMedicineId() == null) {
                            inventoryService.findById(pathInvId).ifPresent(existing -> itemReq.setMedicineId(existing.getMedicineId()));
                        }
                    } catch (NumberFormatException ignored) {}
                }
                PharmacyInventory saved = inventoryService.saveOrUpdateItem(pharmacyId, currentUser.getId(), itemReq);
                sendJson(res, HttpServletResponse.SC_OK, "Inventory saved successfully", saved);
            } catch (IllegalArgumentException e) {
                sendError(res, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
            } catch (Exception e) {
                sendError(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to save inventory: " + e.getMessage());
            }
            return;
        }

        sendError(res, HttpServletResponse.SC_NOT_FOUND, "Inventory action not found");
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        doPost(req, res); // Support PUT as well for updating item
    }
}
