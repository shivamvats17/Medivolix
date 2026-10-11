# Medivolix REST API Documentation

Base URL: `http://localhost:8080/api` (or proxied via Vite at `http://localhost:5173/api`)

### Interactive OpenAPI 3.0 Documentation & Explorer
- **In-App Interactive API Explorer**: Navigate to `http://localhost:5173/api-docs` (includes real-time HTTP testing workbench, auth preset switcher, cURL generator, and parameter controls).
- **OpenAPI 3.0 Specification (JSON)**: `http://localhost:8080/api/openapi.json` or `frontend/public/openapi.json`.
- **OpenAPI 3.0 Specification (YAML)**: [`docs/openapi.yaml`](openapi.yaml).

All responses adhere to the standard JSON wrapper structure:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "error": null,
  "timestamp": 1791665240345
}
```

---

## 1. Authentication Endpoints

### Register Customer
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "fullName": "Ananya Verma",
  "email": "ananya@example.com",
  "phone": "+91 98765 43210",
  "password": "Password@1234"
}
```
- **Response (201 Created)**: Returns safe `UserDto` and initiates user session cookie.

### Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "careplus@medivolix.com",
  "password": "Pharmacy@1234"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 2,
    "email": "careplus@medivolix.com",
    "fullName": "Ramesh Rao (CarePlus)",
    "phone": "+91 98765 11111",
    "role": "PHARMACY_ADMIN",
    "status": "ACTIVE",
    "pharmacyId": 1,
    "pharmacyName": "CarePlus Pharmacy"
  }
}
```

### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Access**: Authenticated
- **Response (200 OK)**: Invalidates HTTP session.

### Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated

---

## 2. Medicine Catalog & Availability Search

### Search Medicines
- **Endpoint**: `GET /api/medicines/search?q={query}&lat={lat}&lng={lng}`
- **Access**: Public
- **Parameters**:
  - `q` (string, optional): Search keyword matching brand name, generic ingredient, or category.
  - `lat`, `lng` (double, optional): User GPS coordinates to compute Haversine distance to each reporting pharmacy.
- **Response (200 OK)**: Returns list of medicines with array of participating approved pharmacies reporting stock, distance in km, stock status (`AVAILABLE`, `LOW_STOCK`, `UNAVAILABLE`, `OUTDATED`), and `isFresh` boolean.

### Get Medicine Details
- **Endpoint**: `GET /api/medicines/{id}`
- **Access**: Public

### List Catalog Medicines
- **Endpoint**: `GET /api/medicines`
- **Access**: Public

---

## 3. Participating Pharmacies

### List Approved Pharmacies
- **Endpoint**: `GET /api/pharmacies?lat={lat}&lng={lng}`
- **Access**: Public (Only returns pharmacies with status `APPROVED`).

### Get Pharmacy Details
- **Endpoint**: `GET /api/pharmacies/{id}`
- **Access**: Public

### Get Pharmacy Inventory
- **Endpoint**: `GET /api/pharmacies/{id}/medicines`
- **Access**: Public

---

## 4. Availability Inquiries (Customer Workflow)

### Submit Availability Request
- **Endpoint**: `POST /api/availability-requests`
- **Access**: Authenticated (`CUSTOMER`)
- **Request Body**:
```json
{
  "pharmacyId": 1,
  "medicineId": 2,
  "requestedQuantity": 2,
  "customerNotes": "Doctor prescribed for ear infection. I have a valid prescription."
}
```
- **Response (201 Created)**: Returns created inquiry record with status `PENDING`.

### View My Submitted Inquiries
- **Endpoint**: `GET /api/availability-requests/my`
- **Access**: Authenticated (`CUSTOMER` sees only their own requests).

### Cancel Pending Inquiry
- **Endpoint**: `POST /api/availability-requests/{id}/cancel`
- **Access**: Authenticated (`CUSTOMER`). Only requests in `PENDING` state can be cancelled.

---

## 5. Pharmacy Inventory Management

### Get Pharmacy Store Inventory
- **Endpoint**: `GET /api/pharmacy/inventory`
- **Access**: Authenticated (`PHARMACY_ADMIN`)

### Add / Update Stock
- **Endpoint**: `POST /api/pharmacy/inventory`
- **Access**: Authenticated (`PHARMACY_ADMIN`)
- **Request Body**:
```json
{
  "medicineId": 1,
  "stockQuantity": 150,
  "price": 32.50,
  "lowStockThreshold": 20,
  "batchNumber": "CP-DOLO-03",
  "expiryDate": "2027-08-31"
}
```

### Mark Item Unavailable
- **Endpoint**: `POST /api/pharmacy/inventory/{id}/unavailable`
- **Access**: Authenticated (`PHARMACY_ADMIN`)

### View Low-Stock Alerts
- **Endpoint**: `GET /api/pharmacy/inventory/low-stock`
- **Access**: Authenticated (`PHARMACY_ADMIN`)

### View Approaching Expiry Batches
- **Endpoint**: `GET /api/pharmacy/inventory/expiry`
- **Access**: Authenticated (`PHARMACY_ADMIN`). Batches expiring within 45 days.

### View Store Requests
- **Endpoint**: `GET /api/pharmacy/requests`
- **Access**: Authenticated (`PHARMACY_ADMIN`)

### Update Inquiry Status
- **Endpoint**: `POST /api/pharmacy/requests/{id}/status`
- **Access**: Authenticated (`PHARMACY_ADMIN`)
- **Request Body**:
```json
{
  "status": "CONFIRMED",
  "notes": "Stock verified and held aside for 3 hours. Please bring prescription."
}
```

### View Store Audit Trail
- **Endpoint**: `GET /api/pharmacy/inventory/audit`
- **Access**: Authenticated (`PHARMACY_ADMIN`)

---

## 6. System Administration

### Get Operational Overview
- **Endpoint**: `GET /api/admin/overview`
- **Access**: Authenticated (`SYSTEM_ADMIN`)

### List All Users
- **Endpoint**: `GET /api/admin/users`
- **Access**: Authenticated (`SYSTEM_ADMIN`)

### List All Pharmacies (All Statuses)
- **Endpoint**: `GET /api/admin/pharmacies`
- **Access**: Authenticated (`SYSTEM_ADMIN`)

### Approve Pharmacy
- **Endpoint**: `POST /api/admin/pharmacies/{id}/approve`
- **Access**: Authenticated (`SYSTEM_ADMIN`)

### Suspend Pharmacy
- **Endpoint**: `POST /api/admin/pharmacies/{id}/suspend`
- **Access**: Authenticated (`SYSTEM_ADMIN`)

---

## 7. System Diagnostics & Health Endpoints

### Platform Health Check
- **Endpoint**: `GET /api/health`
- **Access**: Public
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "System is fully operational",
  "data": {
    "status": "UP",
    "timestamp": 1791665240000,
    "database": {
      "status": "UP",
      "poolName": "MedivolixHikariPool",
      "latencyMs": 2,
      "databaseProduct": "MySQL"
    },
    "system": {
      "javaVersion": "21.0.3",
      "osName": "Windows 11",
      "totalMemoryMb": 512,
      "freeMemoryMb": 256
    }
  }
}
```

### OpenAPI Specification Document
- **Endpoint**: `GET /api/openapi.json`
- **Access**: Public
- **Response (200 OK)**: Returns complete OpenAPI 3.0.3 specification JSON.
