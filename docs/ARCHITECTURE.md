# Medivolix Architecture Documentation

This document describes the architectural design of **Medivolix**, a full-stack medicine availability and participating pharmacy locator web application.

---

## 1. High-Level Architecture Overview

Medivolix follows a decoupled client-server architecture with a **React.js single-page application (SPA)** on the frontend, a **Core Java Jakarta Servlets & JDBC** web application on the backend, and a **MySQL 8.x relational database**.

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|   React 19 + Vite + React Router + Lucide Icons + Vanilla CSS Design System     |
|   (Runs in User's Web Browser on Port 5173 / Production Web Server)             |
+---------------------------------------------------------------------------------+
                                       |
                   HTTP / REST (JSON)  |  Cookies (HttpOnly) & CORS
                                       v
+---------------------------------------------------------------------------------+
|                                 BACKEND TIER                                    |
|   Apache Tomcat 10.1 (Jakarta Servlet API 6.0)                                  |
|   Embedded Runner (com.medivolix.MainApplication) OR medivolix.war Deployment   |
|                                                                                 |
|   +-------------------------------------------------------------------------+   |
|   | Filters: CorsFilter -> AuthFilter (Role Authorization)                  |   |
|   +-------------------------------------------------------------------------+   |
|   | Servlets (Controllers): Auth, Medicine, Pharmacy, Inventory, Admin      |   |
|   +-------------------------------------------------------------------------+   |
|   | Services: Business rules, Freshness check (24h), Haversine Geo distance |   |
|   +-------------------------------------------------------------------------+   |
|   | Repositories: JDBC PreparedStatements, Transactions, Audit Logging      |   |
|   +-------------------------------------------------------------------------+   |
|   | Connection Pool: HikariCP DataSource (Configured via AppConfig)         |   |
|   +-------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------+
                                       |
                   JDBC (Port 3306)    |  PreparedStatements & Transactions
                                       v
+---------------------------------------------------------------------------------+
|                                DATABASE TIER                                    |
|   MySQL 8.x / 9.x Relational Database (`medivolix_db`)                          |
|   9 Normalized Tables, Foreign Keys, Unique Constraints, Composite Indexes      |
+---------------------------------------------------------------------------------+
```

---

## 2. Backend Layered Architecture

To keep the application clear, maintainable, and understandable for beginner developers, the Core Java backend strictly avoids bloated third-party frameworks like Spring Boot, adhering to conventional object-oriented Java EE / Jakarta EE best practices:

### 1. Presentation & Controller Layer (`com.medivolix.controller`)
- Extends `BaseServlet` (inheriting from `jakarta.servlet.http.HttpServlet`).
- Parses JSON request bodies and query parameters using Jackson.
- Sends standardized JSON responses wrapped in `ApiResponse<T>`.
- Returns proper HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Error`).
- Never executes SQL directly.

### 2. Cross-Cutting Filter Layer (`com.medivolix.filter`)
- **`CorsFilter`**: Configures `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials: true`, allowed headers, and handles preflight HTTP `OPTIONS` requests.
- **`AuthFilter`**: Inspects user sessions and headers, validating access to protected paths:
  - `/api/pharmacy/*` &rarr; Enforces `PHARMACY_ADMIN` or `SYSTEM_ADMIN` role and verifies pharmacy assignment.
  - `/api/admin/*` &rarr; Enforces `SYSTEM_ADMIN` role.
  - `/api/availability-requests/*` &rarr; Enforces active login.

### 3. Business Service Layer (`com.medivolix.service`)
- Coordinates multi-repository interactions and business calculations.
- **Stock Freshness**: Dynamically evaluates whether last update timestamp is within the configured freshness threshold (`AppConfig.getStockFreshnessHours()`, default 24h).
- **Proximity Distance**: Implements Haversine spherical trigonometric calculation (`DistanceUtil`) when patient coordinates are available.
- **Sellable Availability**: Derived from active unexpired batches rather than blindly trusting outdated sums.
- **Authorization Guardrails**: Prohibits a pharmacy admin from editing another store's inventory.

### 4. Persistence & Repository Layer (`com.medivolix.repository`)
- Uses standard **JDBC (Java Database Connectivity)**.
- Every database interaction executes via `PreparedStatement` with parameterized placeholders (`?`).
- Multi-step operations (e.g. inventory updates with audit logging) run inside explicit database transactions (`con.setAutoCommit(false)`, `con.commit()`, `con.rollback()`).
- Employs Java try-with-resources to guarantee connection return to HikariCP pool.

### 5. Configuration & Utilities (`com.medivolix.config`, `com.medivolix.util`)
- **`AppConfig`**: Environment variables (`DB_URL`, `PORT`, `CORS_ALLOWED_ORIGINS`) with fallback to `application.properties`.
- **`DatabaseConfig`**: High-performance HikariCP connection pooling.
- **`JsonUtil`**: Centralized Jackson `ObjectMapper` with Java Time Module support.
- **`PasswordUtil`**: Industry-standard **BCrypt** hashing with automated prefix normalization (`$2a$`).

---

## 3. Frontend Architecture

- **React 19 + Vite**: Modern, ultra-fast compilation and HMR development server.
- **Vanilla CSS Design System (`styles/index.css`)**: Accessible, restrained healthcare UI utilizing CSS custom variables. No purple gradients, no pill buttons, no cursor animations.
- **Centralized API Client (`services/api.js`)**: Wraps native `fetch` with automatic JSON parsing, error throwing, credentials inclusion (`credentials: 'include'`), and header propagation.
- **React Context (`context/AuthContext.jsx`)**: Global reactive authentication state, persisting session info and providing role checks (`isCustomer`, `isPharmacyAdmin`, `isSystemAdmin`).
- **Route Guards (`RequireAuth`)**: Protects client-side dashboards based on user role while backend servlets strictly enforce security at the HTTP layer.
