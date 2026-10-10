# Medivolix Security Architecture & Safeguards

This document describes the security controls implemented in Medivolix.

---

## 1. Password Hashing & Storage
- **Algorithm**: Industry-standard **BCrypt** (`org.mindrot:jbcrypt`) with cost factor 10.
- **Prefix Normalization**: `PasswordUtil` automatically normalizes OpenBSD `$2b$` and `$2y$` variants to `$2a$` to prevent authentication mismatches.
- **Data Protection**:
  - Raw passwords are never logged, printed, or stored in plaintext.
  - Password hashes are strictly omitted from API responses via safe DTO projections (`UserDto`).

---

## 2. SQL Injection Prevention
- **Parameterized Statements**: 100% of database queries use JDBC `PreparedStatement` with parameterized placeholders (`?`).
- **No Concatenation**: User inputs are never concatenated into SQL query strings.
- **Input Sanitization**: Search inputs are sanitized and escaped using parameterized `LIKE ?` clauses.

---

## 3. Server-Side Role-Based Authorization
Authorization checks are strictly enforced on the server in `AuthFilter` and Controller servlets. Client-side hiding of buttons is only a UX convenience.

| Route Pattern | Required Role | Enforcement Mechanism |
| :--- | :--- | :--- |
| `/api/admin/*` | `SYSTEM_ADMIN` | `AuthFilter` blocks with `403 Forbidden` |
| `/api/pharmacy/*` | `PHARMACY_ADMIN` | `AuthFilter` blocks with `403 Forbidden` and ensures pharmacy mapping |
| `/api/availability-requests/*` | Logged In | `AuthFilter` requires active session |

---

## 4. Cross-Pharmacy Data Isolation
- A pharmacy administrator can **never** view or modify inventory belonging to another pharmacy.
- In `InventoryRepository` and `InventoryService`, all inventory updates, status changes, and batch recordings require both `inventoryId` and `currentUser.getPharmacyId()`.
- Customer inquiries are strictly filtered: customers can only view requests where `customer_id = currentUser.getId()`.

---

## 5. Session Management & Fixation Protection
- **Session Regeneration**: Upon successful login, existing sessions are invalidated and replaced (`session.invalidate(); req.getSession(true);`) to prevent session fixation attacks.
- **HttpOnly Cookies**: Session cookies are configured with `HttpOnly=true` in `web.xml`, preventing JavaScript access and mitigating XSS attacks.
- **Session Timeout**: Inactive sessions expire automatically after 120 minutes.

---

## 6. Audit Logging & Clinical Integrity
- All modifications to stock quantities, batch entries, and availability status changes are recorded in the `inventory_audit_logs` table.
- Records include the responsible `user_id`, previous quantity, new quantity, delta, timestamp, and explanation.
