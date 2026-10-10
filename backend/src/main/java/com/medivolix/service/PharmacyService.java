package com.medivolix.service;

import com.medivolix.model.Pharmacy;
import com.medivolix.model.PharmacyInventory;
import com.medivolix.repository.InventoryRepository;
import com.medivolix.repository.PharmacyRepository;
import com.medivolix.util.DistanceUtil;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

public class PharmacyService {

    private final PharmacyRepository pharmacyRepository = new PharmacyRepository();
    private final InventoryRepository inventoryRepository = new InventoryRepository();

    public List<Pharmacy> getApprovedPharmacies(Double userLat, Double userLng) {
        List<Pharmacy> list = pharmacyRepository.findAllApproved();
        if (userLat != null && userLng != null) {
            for (Pharmacy p : list) {
                if (p.getLatitude() != null && p.getLongitude() != null) {
                    p.setDistanceKm(DistanceUtil.calculateDistanceKm(userLat, userLng, p.getLatitude(), p.getLongitude()));
                }
            }
            list.sort(Comparator.comparing(p -> p.getDistanceKm() != null ? p.getDistanceKm() : 9999.0));
        }
        return list;
    }

    public Optional<Pharmacy> getPharmacyById(int id) {
        return pharmacyRepository.findById(id);
    }

    public List<PharmacyInventory> getPharmacyInventory(int pharmacyId) {
        return inventoryRepository.findByPharmacyId(pharmacyId);
    }
}
