# Medivolix Database Setup & Documentation

This directory contains the complete database scripts for the Medivolix platform, compatible with MySQL 8.0 through 9.x.

## Files Overview

- **`schema.sql`**: Creates the `medivolix_db` database and all 9 normalized tables with foreign keys, checks, and primary indexes.
- **`indexes.sql`**: Performance indexes optimized for medicine text search, geolocation queries, and request status filtering.
- **`seed.sql`**: Realistic demonstration data (medicines, pharmacies, test users with BCrypt password hashes, inventory batches, and requests).

---

## Quick Initialization

### Method 1: MySQL Command-Line Client (Recommended)

Open **PowerShell** or **Command Prompt** and execute:

```powershell
# Navigate to the database folder
cd C:\Users\hp\.gemini\antigravity-ide\scratch\Medivolix\database

# Run schema creation (replace YOUR_PASSWORD with your MySQL root password)
mysql -u root -p -e "source schema.sql"

# Run indexes
mysql -u root -p -e "source indexes.sql"

# Run seed data
mysql -u root -p -e "source seed.sql"
```

### Method 2: MySQL Workbench

1. Launch **MySQL Workbench** and connect to your local MySQL instance (`localhost:3306`).
2. Go to **File -> Open SQL Script...** and select `schema.sql`.
3. Click the **Execute (Lightning Bolt)** icon.
4. Repeat for `indexes.sql` and `seed.sql`.
5. Refresh the **Schemas** panel on the left; you will see `medivolix_db` populated with tables.

---

## Development Seed Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **SYSTEM_ADMIN** | `admin@medivolix.com` | `Admin@1234` | Full access to approve/suspend pharmacies & view all users |
| **PHARMACY_ADMIN** | `careplus@medivolix.com` | `Pharmacy@1234` | Manages CarePlus Pharmacy (Indiranagar) |
| **PHARMACY_ADMIN** | `apollo@medivolix.com` | `Pharmacy@1234` | Manages Apollo Pharmacy (Koramangala) |
| **CUSTOMER** | `john.doe@example.com` | `Customer@1234` | Test customer with active availability requests |
| **CUSTOMER** | `priya.sharma@example.com` | `Customer@1234` | Test customer |

> **Note on Security:** All passwords in `seed.sql` are stored as industry-standard **BCrypt** hashes (`$2a$10$...`). Never use these default credentials in production!

---

## Entity Relationship Overview

1. `users` &rarr; Central account table. Roles: `CUSTOMER`, `PHARMACY_ADMIN`, `SYSTEM_ADMIN`.
2. `pharmacies` &rarr; Stores licensed physical stores with geolocation and verification status (`PENDING`, `APPROVED`, `SUSPENDED`).
3. `pharmacy_admins` &rarr; Junction table linking `users` with their assigned `pharmacy`.
4. `medicines` &rarr; Standardized medicine catalog (generic composition, brand name, dosage, prescription requirements).
5. `pharmacy_inventory` &rarr; Pharmacy-specific stock level, unit pricing, and last update timestamp.
6. `inventory_batches` &rarr; Granular batch tracking with expiry dates. Only unexpired active batches count toward sellable stock.
7. `availability_requests` &rarr; In-app requests submitted by customers to pharmacies to confirm medicine availability before traveling.
8. `inventory_audit_logs` &rarr; Traceability log capturing all inventory modifications.
9. `system_settings` &rarr; Configurable business parameters (e.g., 24-hour stock freshness threshold).
