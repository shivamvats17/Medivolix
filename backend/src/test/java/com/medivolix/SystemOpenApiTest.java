package com.medivolix;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("System & OpenAPI 3.0 Specification Validation Tests")
public class SystemOpenApiTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    @DisplayName("openapi.json resource must exist and parse as valid OpenAPI 3.0 JSON")
    void testOpenApiJsonValidity() throws Exception {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("openapi.json")) {
            assertNotNull(is, "openapi.json must exist in classpath resources");

            JsonNode root = mapper.readTree(is);
            assertNotNull(root);
            assertEquals("3.0.3", root.path("openapi").asText(), "Should adhere to OpenAPI 3.0.3");

            // Info assertions
            JsonNode info = root.path("info");
            assertEquals("Medivolix REST API", info.path("title").asText());
            assertEquals("1.0.0", info.path("version").asText());

            // Paths verification
            JsonNode paths = root.path("paths");
            assertTrue(paths.has("/health"), "Must declare /health endpoint");
            assertTrue(paths.has("/openapi.json"), "Must declare /openapi.json endpoint");
            assertTrue(paths.has("/auth/login"), "Must declare /auth/login endpoint");
            assertTrue(paths.has("/auth/register"), "Must declare /auth/register endpoint");
            assertTrue(paths.has("/medicines/search"), "Must declare /medicines/search endpoint");
            assertTrue(paths.has("/pharmacies"), "Must declare /pharmacies endpoint");
            assertTrue(paths.has("/pharmacy/inventory"), "Must declare /pharmacy/inventory endpoint");
            assertTrue(paths.has("/availability-requests"), "Must declare /availability-requests endpoint");
            assertTrue(paths.has("/admin/overview"), "Must declare /admin/overview endpoint");

            // Component schemas verification
            JsonNode schemas = root.path("components").path("schemas");
            assertTrue(schemas.has("GenericApiResponse"));
            assertTrue(schemas.has("UserDto"));
            assertTrue(schemas.has("MedicineSearchResultDto"));
            assertTrue(schemas.has("PharmacyInventory"));
            assertTrue(schemas.has("AvailabilityRequest"));
            assertTrue(schemas.has("AdminOverviewDto"));
            assertTrue(schemas.has("HealthStatusDto"));
        }
    }
}
