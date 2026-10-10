# Medivolix Database Schema & Data Dictionary

Database: `medivolix_db`  
Engine: `InnoDB` (ACID Compliant)  
Character Set: `utf8mb4`  
Collation: `utf8mb4_unicode_ci`

---

## 1. Entity Relationship Overview

Medivolix uses a third-normal-form (3NF) relational database structure designed to avoid data duplication while guaranteeing strict referential integrity.

```
       +--------------------+
       |       users        |
       +--------------------+
         | 1               | 1
         |                 |
         v *               v *
+--------------------+   +--------------------+
|  pharmacy_admins   |   | availability_reqs  |
+--------------------+   +--------------------+
         | *                       ^ *
         |                         |
         v 1                       |
+--------------------+             |
|     pharmacies     |<------------+
+--------------------+
         | 1
         |
         v *
+--------------------+          +--------------------+
| pharmacy_inventory |<---------|     medicines      |
+--------------------+ 1      * +--------------------+
         | 1
         |
         v *
+--------------------+
| inventory_batches  |
+--------------------+
```

---

## 2. Table Specifications

### 1. `users`
Central user account table storing authentication credentials and system role.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier |
| `email` | `VARCHAR(150)` | `NOT NULL`, `UNIQUE` | User email for authentication |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Salted BCrypt password hash |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Display name |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Contact telephone string |
| `role` | `ENUM` | `NOT NULL`, DEFAULT `'CUSTOMER'` | `CUSTOMER`, `PHARMACY_ADMIN`, `SYSTEM_ADMIN` |
| `status` | `ENUM` | `NOT NULL`, DEFAULT `'ACTIVE'` | `ACTIVE`, `SUSPENDED`, `PENDING` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account registration time |
| `updated_at` | `TIMESTAMP` | `ON UPDATE CURRENT_TIMESTAMP` | Last profile update |

### 2. `pharmacies`
Stores verified, licensed physical retail pharmacies.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier |
| `name` | `VARCHAR(150)` | `NOT NULL` | Pharmacy legal trade name |
| `license_number` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Official state drug license number |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Store telephone |
| `email` | `VARCHAR(150)` | `NOT NULL` | Store official contact email |
| `address_line1` | `VARCHAR(255)` | `NOT NULL` | Street address |
| `address_line2` | `VARCHAR(255)` | `NULL` | Suite / Block / Landmark |
| `city` | `VARCHAR(100)` | `NOT NULL` | City (e.g. Bengaluru) |
| `state` | `VARCHAR(100)` | `NOT NULL` | State (e.g. Karnataka) |
| `postal_code` | `VARCHAR(20)` | `NOT NULL` | PIN code |
| `latitude` | `DECIMAL(10, 7)`| `NULL` | GPS latitude coordinate |
| `longitude` | `DECIMAL(10, 7)`| `NULL` | GPS longitude coordinate |
| `operating_hours`| `VARCHAR(150)` | `DEFAULT '9:00 AM - 9:00 PM'` | Store hours |
| `status` | `ENUM` | `NOT NULL`, DEFAULT `'PENDING'` | `PENDING`, `APPROVED`, `SUSPENDED`, `REJECTED` |

### 3. `pharmacy_admins`
Maps pharmacy administrators (`users`) to their respective physical `pharmacies`.
- `pharmacy_id` &rarr; Foreign Key references `pharmacies(id)` ON DELETE CASCADE
- `user_id` &rarr; Foreign Key references `users(id)` ON DELETE CASCADE
- `UNIQUE KEY` (`pharmacy_id`, `user_id`) ensures no duplicate administrator mappings.

### 4. `medicines`
Standardized clinical catalog of pharmaceutical drugs.
- `name` (Brand + Strength title)
- `brand_name` (Commercial trade name e.g. "Dolo 650", "Augmentin 625 Duo")
- `generic_name` (Active therapeutic ingredient e.g. "Paracetamol", "Amoxicillin + Clavulanic Acid")
- `strength` (e.g. "650 mg", "500 mg + 125 mg")
- `dosage_form` (e.g. "Tablet", "Capsule", "Syrup", "Inhaler")
- `prescription_required` (`BOOLEAN` - Flags Schedule H/Rx drugs)
- `category` (e.g. "Antibiotics", "Analgesics")

### 5. `pharmacy_inventory`
Live stock reported by pharmacies for specific catalog medicines.
- `pharmacy_id` & `medicine_id` &rarr; Unique composite constraint prevents duplicate rows.
- `stock_quantity` (`INT`, defaults to 0).
- `price` (`DECIMAL(10, 2)`).
- `is_available` (`BOOLEAN`).
- `low_stock_threshold` (`INT`, defaults to 10).
- `last_stock_update` (`TIMESTAMP`, automatically refreshed on updates).

### 6. `inventory_batches`
Tracks individual manufacturing lots and expiration dates.
- `inventory_id` &rarr; FK to `pharmacy_inventory(id)`.
- `batch_number` (`VARCHAR(100)`).
- `quantity` (`INT`).
- `expiry_date` (`DATE`).
- `status` (`ACTIVE`, `EXPIRED`, `DEPLETED`, `QUARANTINED`).

### 7. `availability_requests`
Patient-initiated confirmation inquiries submitted to specific pharmacies before traveling.
- `customer_id` &rarr; FK to `users(id)`.
- `pharmacy_id` &rarr; FK to `pharmacies(id)`.
- `medicine_id` &rarr; FK to `medicines(id)`.
- `requested_quantity` (`INT`, minimum 1).
- `customer_notes` (`TEXT`).
- `status` (`PENDING`, `CONFIRMED`, `UNAVAILABLE`, `CANCELLED`, `COMPLETED`).
- `pharmacy_notes` (`TEXT` - Pharmacy's response).

### 8. `inventory_audit_logs`
Immutable audit log capturing all inventory modifications for clinical traceability.
- `pharmacy_id`, `medicine_id`, `user_id`.
- `action` (`STOCK_ADD`, `STOCK_UPDATE`, `MARK_UNAVAILABLE`, `BATCH_ADD`).
- `quantity_change`, `previous_quantity`, `new_quantity`, `details`, `created_at`.

### 9. `system_settings`
Configurable business threshold key-value pairs (e.g. `stock_freshness_hours` = `24`).
