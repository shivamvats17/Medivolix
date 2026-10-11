# Medivolix QA & Testing Documentation

This report summarizes automated and manual test execution across the Medivolix full-stack platform.

---

## 1. Test Summary Overview

| Layer | Test Type | Status | Results |
| :--- | :--- | :--- | :--- |
| **Backend** | Unit Tests (JUnit 5) | Passed | 22/22 tests passed (0 failures, 0 errors across Distance, Validation, JSON, Password, Freshness, OpenAPI Spec, CSV Export) |
| **Backend** | Maven Compilation | Passed | 50 source files compiled with 0 errors |
| **Backend** | WAR Packaging | Passed | `target/medivolix.war` generated |
| **Database** | Schema, Indexes & Seed | Passed | 9 tables, 10 catalog medicines, 7 users, backup/restore verified |
| **Frontend** | Unit & Component (Vitest) | Passed | 15/15 tests passed across 5 test suites (`exportUtils`, `StatusBadge`, `FreshnessBadge`, `Modal`, `Navbar`) |
| **Frontend** | Static Linting (Oxlint) | Passed | 40 files checked, 0 errors, 0 warnings |
| **Frontend** | Production Build (Vite) | Passed | 1945 modules transformed, bundle in `dist/` |
| **Integration**| End-to-End Workflow API | Passed | 9/9 automated integration tests passed |
| **API Explorer**| OpenAPI 3.0 & Explorer UI | Passed | Live interactive test workbench verified at `/api-docs` |
| **Reporting**| CSV & Clinical PDF Slips | Passed | Inventory CSV, Expiry Audit PDF, and Patient Pickup Slips verified |
| **Browser** | Browser Subagent E2E | Blocked | External environment Playwright 404 driver download limitation |

---

## 2. Automated Integration Test Results

Executed via automated PowerShell integration test suite against live running backend (`http://localhost:8080`) and Vite development server (`http://127.0.0.1:5173`):

1. **Frontend HTML Delivery**:
   - `GET http://127.0.0.1:5173/` &rarr; Status `200 OK`, Title and meta verified.
2. **Catalog Medicine Search**:
   - `GET /api/medicines/search?q=augmentin` &rarr; Returns Amoxicillin + Potassium Clavulanate with participating pharmacy availability and calculated stock states.
3. **Haversine Distance & Freshness Evaluation**:
   - `GET /api/medicines/search?q=dolo&lat=12.9719&lng=77.6412`:
     - CarePlus Pharmacy: `distanceKm = 0.0`, `stockStatus = AVAILABLE`, `isFresh = true`.
     - Apollo Pharmacy: `distanceKm = 4.5`, `stockStatus = AVAILABLE`, `isFresh = true`.
     - MedPlus Pharmacy: `distanceKm = 6.7`, `stockStatus = OUTDATED`, `isFresh = false` (last updated >24 hours ago).
4. **Customer Authentication**:
   - `POST /api/auth/login` with `john.doe@example.com` &rarr; BCrypt verified, role `CUSTOMER`, session created.
5. **Customer Availability Request Submission**:
   - `POST /api/availability-requests` for Pharmacy 1 &rarr; Created request ID `5`, status `PENDING`.
6. **Customer Inquiries Retrieval**:
   - `GET /api/availability-requests/my` &rarr; Scoped strictly to authenticated customer (returns 3 records).
7. **Pharmacy Admin Authentication**:
   - `POST /api/auth/login` with `careplus@medivolix.com` &rarr; Verified, associated with Pharmacy ID 1 (`CarePlus Pharmacy`).
8. **Pharmacy Request Status Update**:
   - `POST /api/pharmacy/requests/5/status` with `CONFIRMED` and response notes &rarr; Database updated, audit recorded.
9. **System Admin Overview & Pharmacy Approval**:
   - `GET /api/admin/overview` &rarr; Live metrics computed: Total Users = 7, Total Pharmacies = 4, Total Inquiries = 5.
   - `POST /api/admin/pharmacies/4/approve` &rarr; Status for LifeCare Chemist transitioned from `PENDING` to `APPROVED`.

---

## 3. Discovered Errors & Resolutions

1. **Missing `java.math.BigDecimal` imports in `PharmacyRepository` and `InventoryRepository`**:
   - *Fix*: Added explicit `import java.math.BigDecimal;` imports. Resolved.
2. **Method signature mismatch in `PharmacyInventoryServlet`**:
   - *Fix*: Aligned call from `getAuditHistory` to `inventoryService.getAuditLogs`. Resolved.
3. **Embedded Tomcat Parent ClassLoader Isolation**:
   - *Fix*: Configured `ctx.setParentClassLoader(MainApplication.class.getClassLoader())` in `MainApplication.java` to allow embedded Tomcat to share classloader with application runtime. Resolved.
4. **Browser Subagent Playwright Environment Failure**:
   - *Observation*: Antigravity browser subagent failed to download Playwright driver due to an external Azure 404 error (`playwright-1.57.0-win32_x64.zip`).
   - *Remediation*: Full HTTP API test suite and curl/Invoke-RestMethod suite executed to independently confirm all application endpoints, cookies, and database state.
