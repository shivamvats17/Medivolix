package com.medivolix;

import com.medivolix.dto.ApiResponse;
import com.medivolix.dto.LoginRequest;
import com.medivolix.model.Medicine;
import com.medivolix.util.JsonUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class JsonUtilTest {

    @Test
    @DisplayName("Should serialize and deserialize ApiResponse successfully")
    public void testApiResponseSerialization() {
        ApiResponse<String> response = ApiResponse.ok("Data loaded successfully");
        String json = JsonUtil.toJson(response);

        assertNotNull(json);
        assertTrue(json.contains("\"success\":true"));
        assertTrue(json.contains("Data loaded successfully"));

        ApiResponse<?> deserialized = JsonUtil.fromJson(json, ApiResponse.class);
        assertNotNull(deserialized);
        assertTrue(deserialized.isSuccess());
        assertEquals("Data loaded successfully", deserialized.getData());
    }

    @Test
    @DisplayName("Should serialize DTO with unknown property tolerance")
    public void testToleranceOfUnknownProperties() {
        String json = "{\"email\":\"test@example.com\",\"password\":\"secret123\",\"extraField\":\"ignoredValue\"}";
        LoginRequest req = JsonUtil.fromJson(json, LoginRequest.class);

        assertNotNull(req);
        assertEquals("test@example.com", req.getEmail());
        assertEquals("secret123", req.getPassword());
    }

    @Test
    @DisplayName("Should handle Medicine model serialization with timestamps")
    public void testMedicineModelSerialization() {
        Medicine med = new Medicine();
        med.setId(101);
        med.setName("Azithromycin");
        med.setGenericName("Azithromycin 500mg");
        med.setDosageForm("TABLET");
        med.setPrescriptionRequired(true);
        med.setCreatedAt(LocalDateTime.now());

        String json = JsonUtil.toJson(med);
        assertNotNull(json);
        assertTrue(json.contains("Azithromycin"));
        assertTrue(json.contains("prescriptionRequired"));

        Medicine deserialized = JsonUtil.fromJson(json, Medicine.class);
        assertNotNull(deserialized);
        assertEquals(101, deserialized.getId());
        assertEquals("Azithromycin", deserialized.getName());
        assertTrue(deserialized.getPrescriptionRequired());
    }
}
