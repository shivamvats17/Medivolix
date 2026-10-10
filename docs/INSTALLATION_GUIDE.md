# Medivolix Installation & Setup Guide

This guide provides beginner-friendly, step-by-step instructions for running the Medivolix full-stack application on Windows.

---

## Prerequisites Checklist

Ensure the following tools are installed on your machine:
1. **Java Development Kit (JDK 17 or higher)**
   - Check with: `java -version`
2. **Node.js (v18 or higher) and npm**
   - Check with: `node -v` and `npm -v`
3. **MySQL Server 8.0 or higher**
   - Running locally on port `3306`.
4. **Apache Maven (3.9+)**
   - Check with: `mvn -v`
5. **Visual Studio Code** (or your preferred editor).

---

## Step 1: Database Initialization

1. Open PowerShell and navigate to the project database folder:
   ```powershell
   cd Medivolix\database
   ```
2. Log in to MySQL and execute the setup scripts in order:
   ```powershell
   # 1. Create database and tables
   Get-Content schema.sql | mysql -u root -p

   # 2. Add performance indexes
   Get-Content indexes.sql | mysql -u root -p

   # 3. Seed demonstration data
   Get-Content seed.sql | mysql -u root -p
   ```
3. Verify that `medivolix_db` has 9 tables:
   ```powershell
   mysql -u root -p -e "SHOW TABLES IN medivolix_db;"
   ```

---

## Step 2: Backend Configuration & Execution

The backend can be run with a single command via the embedded Tomcat launcher or deployed as a standard WAR package.

### Option A: 1-Click Embedded Execution (Recommended for VS Code & Development)

1. Open a **new terminal** (Terminal 1) for the backend:
   ```powershell
   cd Medivolix\backend
   ```
2. Ensure `src/main/resources/application.properties` has your MySQL password:
   ```properties
   db.password=YOUR_MYSQL_PASSWORD
   ```
3. Run the backend using Maven:
   ```powershell
   mvn compile exec:java
   ```
4. The console will display:
   ```
   ===============================================================
     MEDIVOLIX BACKEND SERVER (Apache Tomcat 10.1 / Jakarta Servlets)
   ===============================================================
     Server running on http://localhost:8080
     API Root URL     : http://localhost:8080/api
   ===============================================================
   ```
5. Leave this terminal running in the background.

### Option B: Deploying WAR to External Apache Tomcat 10.1
1. Build the production WAR package:
   ```powershell
   mvn clean package
   ```
2. Copy `target/medivolix.war` to your Apache Tomcat installation's `webapps/` directory:
   ```powershell
   Copy-Item target/medivolix.war C:\xampp\tomcat\webapps\
   ```
3. Start Tomcat using `bin/startup.bat`.

---

## Step 3: Frontend Setup & Execution

1. Open a **separate terminal** (Terminal 2) for the frontend:
   ```powershell
   cd Medivolix\frontend
   ```
2. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```
3. Launch the Vite development server:
   ```powershell
   npm run dev
   ```
4. Open your browser and visit:
   ```
   http://localhost:5173
   ```
   The Vite dev server automatically proxies all `/api/*` calls to the Java backend running on port 8080.

---

## Step 4: Testing Your Setup

Use the built-in demonstration accounts to explore all user roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@medivolix.com` | `Admin@1234` |
| **Pharmacy Admin** | `careplus@medivolix.com` | `Pharmacy@1234` |
| **Customer** | `john.doe@example.com` | `Customer@1234` |

---

## Summary of Ports
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080/api`
- **MySQL Database**: `localhost:3306`
