# Medivolix Troubleshooting & Common Issues Guide

This guide provides clear solutions to common issues encountered during local development.

---

## 1. Port 8080 or 5173 Already in Use

### Symptom:
`Address already in use: bind` or `Port 8080 is in use, trying another one...`

### Solution:
Find and terminate the process holding the port in Windows PowerShell:
```powershell
# For Port 8080 (Backend)
$proc = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess
if ($proc) { Stop-Process -Id $proc -Force }

# For Port 5173 (Frontend)
$proc = (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess
if ($proc) { Stop-Process -Id $proc -Force }
```

Alternatively, change the port in `backend/src/main/resources/application.properties` by setting `server.port=8081`.

---

## 2. MySQL "Access Denied for user 'root'@'localhost'"

### Symptom:
`java.sql.SQLException: Access denied for user 'root'@'localhost' (using password: YES)`

### Solution:
1. Verify your MySQL root password using the command line:
   ```powershell
   mysql -u root -p
   ```
2. Update `backend/src/main/resources/application.properties` with the correct password:
   ```properties
   db.password=YOUR_EXACT_PASSWORD
   ```
3. Or set the `DB_PASSWORD` environment variable in your terminal:
   ```powershell
   $env:DB_PASSWORD="YOUR_EXACT_PASSWORD"
   ```

---

## 3. "Unable to connect to backend server" on Frontend

### Symptom:
Frontend displays: `Unable to connect to backend server. Ensure Tomcat / Java backend is running on port 8080.`

### Solution:
1. Check if the Java backend terminal is actively running.
2. Test the backend directly using PowerShell:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:8080/api/medicines" -Method Get
   ```
3. If it is not running, start it:
   ```powershell
   cd Medivolix\backend
   mvn compile exec:java
   ```

---

## 4. `mvn` Not Recognized in PowerShell

### Symptom:
`mvn : The term 'mvn' is not recognized as the name of a cmdlet...`

### Solution:
Maven's `bin` directory must be in your user `Path` environment variable:
```powershell
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$userPath;C:\Users\hp\apache-maven-3.9.9\bin", "User")
```
Close and reopen PowerShell to reload the updated PATH.

---

## 5. Blank Page or CORS Error in Browser Console

### Symptom:
`Access to fetch at 'http://localhost:8080/api/...' has been blocked by CORS policy`

### Solution:
1. Ensure you access the frontend at `http://localhost:5173` or `http://127.0.0.1:5173` (both are whitelisted in `CorsFilter`).
2. Verify `cors.allowedOrigins` in `backend/src/main/resources/application.properties` matches your frontend address.
