package com.medivolix.service;

import com.medivolix.dto.CreateAvailabilityRequestDto;
import com.medivolix.model.AvailabilityRequest;
import com.medivolix.model.Pharmacy;
import com.medivolix.repository.AvailabilityRequestRepository;
import com.medivolix.repository.PharmacyRepository;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class AvailabilityRequestService {

    private final AvailabilityRequestRepository requestRepository = new AvailabilityRequestRepository();
    private final PharmacyRepository pharmacyRepository = new PharmacyRepository();

    public AvailabilityRequest createRequest(int customerId, CreateAvailabilityRequestDto dto) throws SQLException {
        if (dto.getPharmacyId() == null || dto.getMedicineId() == null) {
            throw new IllegalArgumentException("Pharmacy ID and Medicine ID are required");
        }
        if (dto.getRequestedQuantity() == null || dto.getRequestedQuantity() < 1) {
            throw new IllegalArgumentException("Requested quantity must be at least 1 unit");
        }

        Optional<Pharmacy> pharmacyOpt = pharmacyRepository.findById(dto.getPharmacyId());
        if (pharmacyOpt.isEmpty() || pharmacyOpt.get().getStatus() != Pharmacy.Status.APPROVED) {
            throw new IllegalArgumentException("Selected pharmacy is not active or approved");
        }

        AvailabilityRequest req = new AvailabilityRequest();
        req.setCustomerId(customerId);
        req.setPharmacyId(dto.getPharmacyId());
        req.setMedicineId(dto.getMedicineId());
        req.setRequestedQuantity(dto.getRequestedQuantity());
        req.setCustomerNotes(dto.getCustomerNotes() != null ? dto.getCustomerNotes().trim() : null);
        req.setStatus(AvailabilityRequest.Status.PENDING);

        return requestRepository.create(req);
    }

    public List<AvailabilityRequest> getCustomerRequests(int customerId) {
        return requestRepository.findByCustomerId(customerId);
    }

    public List<AvailabilityRequest> getPharmacyRequests(int pharmacyId) {
        return requestRepository.findByPharmacyId(pharmacyId);
    }

    public Optional<AvailabilityRequest> getRequestById(int id) {
        return requestRepository.findById(id);
    }

    public boolean updateStatusByPharmacy(int requestId, int pharmacyId, String newStatus, String notes) {
        try {
            AvailabilityRequest.Status status = AvailabilityRequest.Status.valueOf(newStatus.toUpperCase());
            return requestRepository.updateStatus(requestId, pharmacyId, status, notes);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }
    }

    public boolean cancelByCustomer(int requestId, int customerId) {
        return requestRepository.cancelByCustomer(requestId, customerId);
    }
}
