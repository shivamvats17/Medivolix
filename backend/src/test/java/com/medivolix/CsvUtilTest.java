package com.medivolix;

import com.medivolix.util.CsvUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("CSV Export Utility (RFC 4180) Tests")
public class CsvUtilTest {

    @Test
    @DisplayName("Should escape null, plain text, and special characters properly")
    void testEscape() {
        assertEquals("\"\"", CsvUtil.escape(null));
        assertEquals("\"Augmentin\"", CsvUtil.escape("Augmentin"));
        assertEquals("\"Amoxicillin, Clavulanate\"", CsvUtil.escape("Amoxicillin, Clavulanate"));
        assertEquals("\"Tab \"\"Dolo\"\" 650\"", CsvUtil.escape("Tab \"Dolo\" 650"));
        assertEquals("\"Line1\nLine2\"", CsvUtil.escape("Line1\nLine2"));
    }

    @Test
    @DisplayName("Should generate complete RFC 4180 CSV with headers and rows")
    void testToCsv() {
        List<String> headers = Arrays.asList("Medicine", "Price", "Stock");
        List<List<Object>> rows = Arrays.asList(
                Arrays.asList("Augmentin 625", 204.50, 45),
                Arrays.asList("Dolo 650, Tab", 32.00, 100)
        );

        String csv = CsvUtil.toCsv(headers, rows, true);
        assertNotNull(csv);
        assertTrue(csv.startsWith(CsvUtil.UTF8_BOM), "Must include UTF-8 BOM");
        assertTrue(csv.contains("\"Medicine\",\"Price\",\"Stock\""));
        assertTrue(csv.contains("\"Augmentin 625\",\"204.5\",\"45\""));
        assertTrue(csv.contains("\"Dolo 650, Tab\",\"32.0\",\"100\""));
    }

    @Test
    @DisplayName("Should handle empty rows gracefully")
    void testEmptyRows() {
        List<String> headers = Collections.singletonList("ID");
        String csv = CsvUtil.toCsv(headers, Collections.emptyList(), false);
        assertEquals("\"ID\"\r\n", csv);
    }
}
