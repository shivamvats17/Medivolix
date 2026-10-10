package com.medivolix;

import com.medivolix.util.ValidationUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ValidationUtilTest {

    @Test
    @DisplayName("Should accept valid email formats")
    public void testValidEmailFormats() {
        assertTrue(ValidationUtil.isValidEmail("john.doe@example.com"));
        assertTrue(ValidationUtil.isValidEmail("patient123@hospital.org"));
        assertTrue(ValidationUtil.isValidEmail("admin+support@medivolix.health"));
        assertTrue(ValidationUtil.isValidEmail("care_center@pharma.co"));
    }

    @Test
    @DisplayName("Should reject invalid email formats")
    public void testInvalidEmailFormats() {
        assertFalse(ValidationUtil.isValidEmail(null));
        assertFalse(ValidationUtil.isValidEmail(""));
        assertFalse(ValidationUtil.isValidEmail("   "));
        assertFalse(ValidationUtil.isValidEmail("plainaddress"));
        assertFalse(ValidationUtil.isValidEmail("missing.domain@"));
        assertFalse(ValidationUtil.isValidEmail("@missingusername.com"));
        assertFalse(ValidationUtil.isValidEmail("spaces in@email.com"));
    }

    @Test
    @DisplayName("Should validate correct phone numbers")
    public void testValidPhoneNumbers() {
        assertTrue(ValidationUtil.isValidPhone("+919876543210"));
        assertTrue(ValidationUtil.isValidPhone("9876543210"));
        assertTrue(ValidationUtil.isValidPhone("+1-800-555-0199"));
        assertTrue(ValidationUtil.isValidPhone("080-23456789"));
    }

    @Test
    @DisplayName("Should reject malformed phone numbers")
    public void testInvalidPhoneNumbers() {
        assertFalse(ValidationUtil.isValidPhone(null));
        assertFalse(ValidationUtil.isValidPhone(""));
        assertFalse(ValidationUtil.isValidPhone("12345")); // too short (<8 digits)
        assertFalse(ValidationUtil.isValidPhone("phone-number-here"));
    }

    @Test
    @DisplayName("Should correctly test blank and empty strings")
    public void testIsBlank() {
        assertTrue(ValidationUtil.isBlank(null));
        assertTrue(ValidationUtil.isBlank(""));
        assertTrue(ValidationUtil.isBlank("   \t\n  "));
        assertFalse(ValidationUtil.isBlank("Paracetamol"));
    }

    @Test
    @DisplayName("Should clean and trim strings safely")
    public void testClean() {
        assertEquals("", ValidationUtil.clean(null));
        assertEquals("", ValidationUtil.clean("   "));
        assertEquals("Amoxicillin", ValidationUtil.clean("  Amoxicillin  "));
    }
}
