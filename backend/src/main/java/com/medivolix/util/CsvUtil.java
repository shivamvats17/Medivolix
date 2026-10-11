package com.medivolix.util;

import java.util.List;

/**
 * CsvUtil formats structured tabular datasets into standard RFC 4180 compliant CSV.
 * Features automated value escaping, quote sanitization, and optional UTF-8 BOM prefix.
 */
public class CsvUtil {

    public static final String UTF8_BOM = "\uFEFF";

    /**
     * Escapes a single cell value according to RFC 4180 specifications.
     */
    public static String escape(Object value) {
        if (value == null) {
            return "\"\"";
        }
        String str = value.toString();
        if (str.contains("\"") || str.contains(",") || str.contains("\n") || str.contains("\r")) {
            return "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return "\"" + str + "\"";
    }

    /**
     * Converts a collection of headers and row lists into an RFC 4180 compliant CSV string.
     */
    public static String toCsv(List<String> headers, List<List<Object>> rows, boolean includeBom) {
        StringBuilder sb = new StringBuilder();
        if (includeBom) {
            sb.append(UTF8_BOM);
        }

        // 1. Headers
        if (headers != null && !headers.isEmpty()) {
            for (int i = 0; i < headers.size(); i++) {
                sb.append(escape(headers.get(i)));
                if (i < headers.size() - 1) {
                    sb.append(",");
                }
            }
            sb.append("\r\n");
        }

        // 2. Data Rows
        if (rows != null) {
            for (List<Object> row : rows) {
                if (row != null) {
                    for (int i = 0; i < row.size(); i++) {
                        sb.append(escape(row.get(i)));
                        if (i < row.size() - 1) {
                            sb.append(",");
                        }
                    }
                    sb.append("\r\n");
                }
            }
        }

        return sb.toString();
    }
}
