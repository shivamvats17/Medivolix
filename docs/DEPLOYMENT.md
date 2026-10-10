# Medivolix Production Deployment Guide

This guide details the procedures for deploying Medivolix to production environments.

---

## 1. Production Architecture Overview

In a typical production deployment:
1. **Frontend**: Static bundle (`frontend/dist`) hosted on a CDN / Static Web Host (e.g. Vercel, Netlify, AWS S3 + CloudFront, or Nginx).
2. **Backend**: WAR file (`medivolix.war`) running in an Apache Tomcat 10.1 container (or standalone Docker container / AWS Elastic Beanstalk / Linux VM).
3. **Database**: Managed MySQL 8.x database (e.g. AWS RDS, DigitalOcean Managed Database) configured with SSL and automated backups.

---

## 2. Building Production Artifacts

### 1. Build Frontend Distribution
```powershell
cd Medivolix\frontend
npm install
npm run build
```
- Output directory: `frontend/dist/`
- Contains optimized `index.html`, minified CSS, and chunked JavaScript.

### 2. Build Backend WAR Package
```powershell
cd Medivolix\backend
mvn clean package -DskipTests
```
- Output file: `backend/target/medivolix.war`

---

## 3. Production Environment Configuration

In production, avoid hardcoding database credentials or URLs in files. Set environment variables on the hosting server:

```bash
# Server Port
PORT=8080

# Production MySQL Connection with SSL
DB_URL="jdbc:mysql://db.production.internal:3306/medivolix_db?useSSL=true&requireSSL=true&serverTimezone=UTC&characterEncoding=UTF-8"
DB_USER="medivolix_prod_user"
DB_PASSWORD="SECURE_PRODUCTION_PASSWORD"

# Whitelisted Production Frontend Origin
CORS_ALLOWED_ORIGINS="https://app.medivolix.com,https://medivolix.com"

# Business Freshness Thresholds
STOCK_FRESHNESS_HOURS=24
LOW_STOCK_THRESHOLD=10
EXPIRY_WARNING_DAYS=45
```

---

## 4. Apache Tomcat 10.1 Server Setup

1. Install Apache Tomcat 10.1 on a Linux or Windows Server.
2. Configure Tomcat `conf/server.xml` with HTTPS and secure connectors.
3. Enable HTTP Strict Transport Security (HSTS) and Secure Cookie flags.
4. Copy `target/medivolix.war` to `$CATALINA_HOME/webapps/ROOT.war` (for root context) or `$CATALINA_HOME/webapps/medivolix.war`.

---

## 5. Custom Domain & DNS Configuration

1. **DNS Records**:
   - `A` / `CNAME` record pointing `app.medivolix.com` to your frontend host.
   - `A` / `CNAME` record pointing `api.medivolix.com` to your backend Tomcat reverse proxy (e.g. Nginx).
2. **TLS / SSL Certificates**:
   - Obtain automated Let's Encrypt certificates using Certbot.
   - Enforce HTTPS redirect for all HTTP requests.

---

## 6. Pre-Launch Verification Checklist

Before declaring public availability:
- [ ] Production MySQL database initialized with `schema.sql` and `indexes.sql`.
- [ ] Default seed credentials changed or removed.
- [ ] HTTPS operational on custom domain.
- [ ] CORS limited to production domain origins.
- [ ] Database automated daily snapshots enabled.
- [ ] Local drug licensing and healthcare regulatory notices verified with legal counsel.
