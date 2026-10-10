package com.medivolix.service;

import com.medivolix.config.AppConfig;
import com.medivolix.dto.MedicineSearchResultDto;
import com.medivolix.model.Medicine;
import com.medivolix.model.PharmacyInventory;
import com.medivolix.repository.InventoryRepository;
import com.medivolix.repository.MedicineRepository;
import com.medivolix.util.DistanceUtil;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

public class MedicineService {

    private final MedicineRepository medicineRepository = new MedicineRepository();
    private final InventoryRepository inventoryRepository = new InventoryRepository();

    public List<MedicineSearchResultDto> search(String query, Double userLat, Double userLng) {
        List<Medicine> medicines = medicineRepository.search(query);
        List<MedicineSearchResultDto> results = new ArrayList<>();

        for (Medicine m : medicines) {
            MedicineSearchResultDto dto = new MedicineSearchResultDto(m);
            List<PharmacyInventory> inventoryList = inventoryRepository.findReportingPharmaciesForMedicine(m.getId());

            enrichInventoryWithCalculatedFields(inventoryList, userLat, userLng);

            // Sort pharmacies: available/fresh first, then closest distance
            if (userLat != null && userLng != null) {
                inventoryList.sort(Comparator
                        .comparing((PharmacyInventory i) -> !"AVAILABLE".equals(i.getStockStatus()) && !"LOW_STOCK".equals(i.getStockStatus()))
                        .thenComparing(i -> i.getDistanceKm() != null ? i.getDistanceKm() : 9999.0));
            } else {
                inventoryList.sort(Comparator
                        .comparing((PharmacyInventory i) -> !"AVAILABLE".equals(i.getStockStatus()) && !"LOW_STOCK".equals(i.getStockStatus()))
                        .thenComparing(PharmacyInventory::getLastStockUpdate, Comparator.nullsLast(Comparator.reverseOrder())));
            }

            dto.setAvailablePharmacies(inventoryList);
            results.add(dto);
        }
        return results;
    }

    public MedicineSearchResultDto getMedicineDetails(int medicineId, Double userLat, Double userLng) {
        Optional<Medicine> medOpt = medicineRepository.findById(medicineId);
        if (medOpt.isEmpty()) {
            return null;
        }

        Medicine m = medOpt.get();
        MedicineSearchResultDto dto = new MedicineSearchResultDto(m);
        List<PharmacyInventory> inventoryList = inventoryRepository.findReportingPharmaciesForMedicine(m.getId());
        enrichInventoryWithCalculatedFields(inventoryList, userLat, userLng);

        if (userLat != null && userLng != null) {
            inventoryList.sort(Comparator
                    .comparing((PharmacyInventory i) -> !"AVAILABLE".equals(i.getStockStatus()) && !"LOW_STOCK".equals(i.getStockStatus()))
                    .thenComparing(i -> i.getDistanceKm() != null ? i.getDistanceKm() : 9999.0));
        }

        dto.setAvailablePharmacies(inventoryList);
        return dto;
    }

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    private void enrichInventoryWithCalculatedFields(List<PharmacyInventory> inventoryList, Double userLat, Double userLng) {
        int freshnessHours = AppConfig.getStockFreshnessHours();
        LocalDateTime now = LocalDateTime.now();

        for (PharmacyInventory item : inventoryList) {
            // Freshness calculation
            boolean fresh = true;
            if (item.getLastStockUpdate() != null) {
                long hoursOld = Math.abs(Duration.between(item.getLastStockUpdate(), now).toHours());
                fresh = (hoursOld <= freshnessHours);
            }
            item.setIsFresh(fresh);

            // Stock status classification
            if (!Boolean.TRUE.equals(item.getIsAvailable()) || item.getStockQuantity() == null || item.getStockQuantity() <= 0) {
                item.setStockStatus("UNAVAILABLE");
            } else if (item.getStockQuantity() <= (item.getLowStockThreshold() != null ? item.getLowStockThreshold() : 10)) {
                item.setStockStatus("LOW_STOCK");
            } else if (!fresh) {
                item.setStockStatus("OUTDATED");
            } else {
                item.setStockStatus("AVAILABLE");
            }

            // Distance calculation
            if (userLat != null && userLng != null && item.getPharmacyLatitude() != null && item.getPharmacyLongitude() != null) {
                item.setDistanceKm(DistanceUtil.calculateDistanceKm(userLat, userLng, item.getPharmacyLatitude(), item.getPharmacyLongitude()));
            }
        }
    }
}
