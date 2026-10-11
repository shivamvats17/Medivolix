# MEDIVOLIX
### Medicine Availability & Participating Pharmacy Finder

Medivolix is a full-stack healthcare web application designed to eliminate the frustration of patients calling or traveling to multiple pharmacies in search of available medications. The platform enables users to search for medications, compare reported stock availability at participating pharmacies, view last-updated timestamps, evaluate real-world distance, and submit in-app availability inquiries before traveling.

---

## 1. Problem Statement & Solution

### The Problem
Patients and caregivers frequently experience distress when searching for prescribed medicines that may be out of stock at neighborhood pharmacies. Calling pharmacies takes time, inventory changes constantly, and traveling physically between multiple locations wastes critical hours during emergencies.

### The Medivolix Solution
Medivolix provides:
- **Transparent Stock Discovery**: Patients search by brand name, generic composition, or dosage form and see which participating pharmacies report having stock.
- **Stock Freshness Evaluation**: An automatic 24-hour freshness threshold flags inventory that hasn't been recently updated by the pharmacy as *Outdated*.
- **Proximity Distance**: Automatically calculates real-world distance in kilometers from the user's location to the pharmacy using the Haversine formula.
- **In-App Availability Confirmation**: Customers can submit an availability inquiry directly to a pharmacy with requested quantities and notes.
- **Pharmacy Inventory Management**: Participating pharmacies manage stock, track batches with approaching expiration dates (&le; 45 days), and review customer inquiries.
- **Strict Disclaimers**: Stock levels are reported by pharmacies and may fluctuate. The platform never presents outdated or unverified stock as guaranteed.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js 19 with Vite.
- **Routing**: React Router DOM (v7).
- **Icons**: Lucide React.
- **Styling**: Vanilla CSS with custom properties (`styles/index.css`). Restrained healthcare aesthetic (white/slate neutral canvas, charcoal text, emerald/teal accents). No purple gradients, no capsule/pill buttons, no scroll-jacking animations.
- **HTTP Client**: Centralized Fetch API client (`services/api.js`).

### Backend
- **Core Technology**: Java 17+ (Compiled with Java 26 / JDK).
- **Web API**: Jakarta Servlet API 6.0 (Apache Tomcat 10.1 specification).
- **Database Access**: Java Database Connectivity (JDBC) with HikariCP connection pooling.
- **Build System**: Apache Maven 3.9+.
- **JSON Serialization**: Jackson 2.17 (`jackson-databind`, `jackson-datatype-jsr310`).
- **Security**: Salted BCrypt password hashing (`jbcrypt`).
- **Architecture**: Conventional layered Java architecture (Controllers, Services, Repositories, Models, DTOs, Filters, Utilities, Config). No Spring Boot or third-party web frameworks.

### Database
- **Engine**: MySQL 8.x / 9.x Community Server.
- **Schema**: 9 normalized relational tables with foreign keys, checks, and composite performance indexes.
- **Safety**: 100% PreparedStatements, database transactions for stock adjustments, and immutable inventory audit logs.

---

## 3. Project Directory Structure

```
Medivolix/
|-- frontend/
|   |-- public/
|   |   |-- favicon.svg              # Original Medivolix SVG icon
|   |   |-- robots.txt               # SEO and crawler permissions
|   |-- src/
|   |   |-- components/
|   |   |   |-- common/              # Navbar, Footer, Modal, StatusBadge, FreshnessBadge
|   |   |   |-- layout/              # Layout wrapper
|   |   |-- pages/
|   |   |   |-- Home.jsx             # Landing page with primary search & 3-step guide
|   |   |   |-- SearchMedicines.jsx  # Live search with distance & freshness filters
|   |   |   |-- MedicineDetails.jsx  # Specifications, pharmacy stock, inquiry modal
|   |   |   |-- PharmacyDetails.jsx  # Pharmacy store profile & inventory catalog
|   |   |   |-- Login.jsx            # Authentication with quick-fill demo buttons
|   |   |   |-- Register.jsx         # Customer registration
|   |   |   |-- UserDashboard.jsx    # Patient inquiry tracking & cancellation
|   |   |   |-- PharmacyDashboard.jsx# Inventory, low-stock, expiry, & inquiry handling
|   |   |   |-- AdminDashboard.jsx   # Real metrics, pharmacy approval, user list
|   |   |   |-- ApiExplorer.jsx      # Interactive OpenAPI 3.0 REST tester & explorer
|   |   |   |-- PrivacyPolicy.jsx    # Transparency & governance legal disclosure
|   |   |   |-- TermsAndConditions.jsx# Platform limitations & operating terms
|   |   |   |-- NotFound.jsx         # 404 error page
|   |   |-- services/                # api.js, authService, medicineService, etc.
|   |   |-- utils/                   # exportUtils.js (RFC 4180 CSV & printable clinical PDF slips)
|   |   |-- context/                 # AuthContext (reactive user session state)
|   |   |-- styles/                  # index.css (Healthcare design tokens)
|   |   |-- App.jsx                  # React Router configuration
|   |   |-- main.jsx                 # Vite application mount
|   |-- package.json
|   |-- vite.config.js
|
|-- backend/
|   |-- pom.xml                      # Maven dependencies (Jakarta, HikariCP, Tomcat embed)
|   |-- src/
|   |   |-- main/
|   |   |   |-- java/com/medivolix/
|   |   |   |   |-- config/          # AppConfig, DatabaseConfig (HikariCP)
|   |   |   |   |-- controller/      # Servlets: Auth, Medicine, Pharmacy, Inventory, Admin
|   |   |   |   |-- service/         # Business services (Distance, Freshness, Inventory)
|   |   |   |   |-- repository/      # JDBC repositories with PreparedStatements
|   |   |   |   |-- model/           # User, Pharmacy, Medicine, Inventory, Batch, Request
|   |   |   |   |-- dto/             # ApiResponse, LoginRequest, SearchResultDto, etc.
|   |   |   |   |-- filter/          # CorsFilter, AuthFilter
|   |   |   |   |-- util/            # JsonUtil, PasswordUtil (BCrypt), DistanceUtil, CsvUtil
|   |   |   |   |-- listener/        # AppContextListener (pool lifecycle)
|   |   |   |   |-- MainApplication.java # 1-click embedded Tomcat 10.1 launcher
|   |   |   |-- resources/
|   |   |   |   |-- application.properties
|   |   |   |-- webapp/WEB-INF/web.xml # Deployment descriptor for Tomcat 10.1
|   |   |-- test/java/com/medivolix/ # JUnit 5 test cases
|
|-- database/
|   |-- schema.sql                   # Schema creation for all 9 normalized tables
|   |-- indexes.sql                  # Optimized composite indexes for search & queries
|   |-- seed.sql                     # Realistic medicines, pharmacies, and demo users
|   |-- README.md                    # Database documentation
|
|-- docs/
|   |-- PROJECT_OVERVIEW.md          # High-level vision and requirements
|   |-- ARCHITECTURE.md              # Layered architectural design
|   |-- DATABASE_SCHEMA.md           # ER diagram and data dictionary
|   |-- API_DOCUMENTATION.md         # Full REST endpoints reference
|   |-- openapi.yaml                 # Formal OpenAPI 3.0 specification definition
|   |-- INSTALLATION_GUIDE.md        # Beginner installation walkthrough
|   |-- TROUBLESHOOTING.md           # Common errors and resolutions
|   |-- SECURITY.md                  # Security controls & BCrypt implementation
|   |-- DEPLOYMENT.md                # WAR build & production deployment
|   |-- TESTING.md                   # QA test execution report
|   |-- GITHUB_WORKFLOW.md           # Git guide and synchronization
|
|-- .gitignore
|-- .gitattributes
|-- .editorconfig
|-- LICENSE
|-- README.md
```

---

## 4. Prerequisites

Before running the application, make sure you have:
1. **Java JDK 17 or higher** (`java -version`).
2. **Node.js 18+ and npm** (`node -v`, `npm -v`).
3. **MySQL Server 8.0+** running locally on port `3306`.
4. **Apache Maven 3.9+** (`mvn -v`).

---

## 5. Quick-Start Guide (Windows PowerShell)

You will need **two terminal windows**: one for the backend and one for the frontend.

### Terminal 1: Initialize Database & Run Java Backend

1. **Initialize MySQL Database**:
   ```powershell
   cd Medivolix\database
   Get-Content schema.sql | mysql -u root -p
   Get-Content indexes.sql | mysql -u root -p
   Get-Content seed.sql | mysql -u root -p
   ```
   *(Enter your MySQL root password when prompted).*

2. **Configure Connection Properties**:
   Open `backend/src/main/resources/application.properties` and verify your MySQL password:
   ```properties
   db.url=jdbc:mysql://localhost:3306/medivolix_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
   db.user=root
   db.password=YOUR_MYSQL_PASSWORD
   ```

3. **Start the Java Servlet Backend**:
   ```powershell
   cd ..\backend
   mvn compile exec:java
   ```
   The backend server will start on `http://localhost:8080/api`.

---

### Terminal 2: Run React Frontend

1. **Open a new PowerShell window** and navigate to the frontend directory:
   ```powershell
   cd Medivolix\frontend
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Start Vite development server**:
   ```powershell
   npm run dev
   ```
   The frontend will be accessible at: `http://localhost:5173`.

---

## 6. Demonstration & Evaluation Accounts

All seed passwords are encrypted using BCrypt (`$2a$10$...`) in MySQL. For convenience, the Login page includes 1-click **Quick Fill** buttons:

| Role | Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **SYSTEM_ADMIN** | `admin@medivolix.com` | `Admin@1234` | Approves or suspends pharmacies; views live DB statistics |
| **PHARMACY_ADMIN** | `careplus@medivolix.com` | `Pharmacy@1234` | Manages CarePlus Pharmacy stock, batches, and patient inquiries |
| **PHARMACY_ADMIN** | `apollo@medivolix.com` | `Pharmacy@1234` | Manages Apollo Pharmacy inventory and inquiries |
| **CUSTOMER** | `john.doe@example.com` | `Customer@1234` | Searches medicines, views distance, submits availability inquiries |
| **CUSTOMER** | `priya.sharma@example.com` | `Customer@1234` | Test customer |

---

## 7. Automated Testing & Verification

1. **Run Backend JUnit 5 Tests**:
   ```powershell
   cd Medivolix\backend
   mvn test
   ```
2. **Run Frontend Vitest Tests**:
   ```powershell
   cd Medivolix\frontend
   npm test
   ```
3. **Build Production WAR Package**:
   ```powershell
   mvn clean package
   ```
   Generates `target/medivolix.war` for deployment to standalone Apache Tomcat 10.1 `webapps/`.
4. **Build Frontend Production Bundle**:
   ```powershell
   npm run build
   ```
   Compiles into `frontend/dist/`.

---

## 8. Interactive REST API Explorer & OpenAPI 3.0

Medivolix includes a built-in interactive developer workbench and formal OpenAPI 3.0 specification:
- **In-App API Explorer**: Navigate to `http://localhost:5173/api-docs` (supports real-time parameter tweaking, live HTTP testing, auth preset switcher, cURL generation, and JSON inspection).
- **OpenAPI 3.0 Specification (JSON)**: Hosted live at `http://localhost:8080/api/openapi.json` and bundled in `frontend/public/openapi.json`.
- **OpenAPI 3.0 Specification (YAML)**: Located in [`docs/openapi.yaml`](docs/openapi.yaml).
- **Platform Diagnostics**: Live HikariCP and JVM diagnostic health check at `http://localhost:8080/api/health`.

---

## 9. Pre-Launch Verification Checklist

- [x] React frontend works with responsive layout and accessible form validation.
- [x] Core Java Servlets backend runs without external Spring frameworks.
- [x] MySQL database connected via HikariCP connection pooling.
- [x] Main workflows verified (Medicine search, Haversine distance, stock freshness, availability inquiries).
- [x] Role-based authentication and BCrypt password hashing functional.
- [x] Cross-pharmacy access restrictions strictly enforced on the server.
- [x] Production WAR file builds successfully (`target/medivolix.war`).
- [x] Production React bundle builds successfully (`frontend/dist`).
- [x] Automated Vitest frontend unit & component test suite (15/15 tests passing).
- [x] OpenAPI 3.0 specification and interactive REST API Explorer (`/api-docs`) implemented.
- [x] RFC 4180 CSV data export and printable clinical PDF confirmation slips functional.
- [x] Original SVG favicon loads and meta descriptions configured.
- [x] Privacy Policy (`/privacy-policy`) and Terms and Conditions (`/terms-and-conditions`) available.
- [x] Transparent freshness disclaimers implemented; no fake metrics or reviews.
- [ ] NOT READY FOR PUBLIC LAUNCH: Custom domain DNS, production HTTPS, and state drug regulatory review pending owner deployment.

---

## 10. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
