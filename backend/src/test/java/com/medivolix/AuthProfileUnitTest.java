package com.medivolix;

import com.medivolix.dto.UpdateProfileRequest;
import com.medivolix.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("User Profile DTO and Service Validation Tests")
public class AuthProfileUnitTest {

    @Test
    @DisplayName("UpdateProfileRequest getters and setters function correctly")
    void testUpdateProfileRequestDto() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Dr. Shivam Vats");
        request.setPhone("+91 98765 43210");

        assertEquals("Dr. Shivam Vats", request.getFullName());
        assertEquals("+91 98765 43210", request.getPhone());
    }

    @Test
    @DisplayName("AuthService updateProfile rejects blank or null full names")
    void testAuthServiceUpdateProfileValidation() {
        AuthService authService = new AuthService();

        IllegalArgumentException ex1 = assertThrows(
                IllegalArgumentException.class,
                () -> authService.updateProfile(1, null, "+91 98765 43210")
        );
        assertEquals("Full name cannot be blank", ex1.getMessage());

        IllegalArgumentException ex2 = assertThrows(
                IllegalArgumentException.class,
                () -> authService.updateProfile(1, "   ", "+91 98765 43210")
        );
        assertEquals("Full name cannot be blank", ex2.getMessage());
    }
}
