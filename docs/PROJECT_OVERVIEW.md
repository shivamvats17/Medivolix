# Medivolix - Project Overview

## 1. Executive Summary

**Medivolix** is an open-architecture, full-stack medicine availability and pharmacy locator web application. It addresses a widespread healthcare pain point: patients, caregivers, and families calling dozens of pharmacies or travelling across neighbourhoods in desperate search of essential medicines during emergencies and routine treatments.

Medivolix connects community pharmacies with citizens by providing:
- **Database-Backed Search**: Rapidly find medicines by brand name, generic salt, strength, dosage form, or therapeutic category.
- **Reported Availability**: View which licensed pharmacies currently report having stock on hand.
- **Freshness Transparency**: Explicit timestamps and status badges (Fresh, Moderate, Stale/Outdated >24h) ensure users never mistake outdated reports for guaranteed stock.
- **Availability Requests**: In-app digital requests allowing patients to request confirmation from pharmacists before travelling.
- **Pharmacy Operations**: Comprehensive inventory management, batch tracking, expiry date monitoring, and real-time request handling.
- **Administrative Governance**: Oversight workflows for platform administrators to review pharmacy licenses and verify operating legitimacy before public listing.

---

## 2. Problem Statement

1. **Information Asymmetry**: Pharmacies maintain localized inventory systems, but patients have no unified way to locate rare or critical medicines without physically visiting multiple counters.
2. **Perishable & Volatile Stock**: Medicine stock changes hourly. Platforms that show static "in stock" tags without timestamps create false hope and wasted travel time.
3. **Safety & Regulatory Concerns**: Unregulated online sales risk counterfeit distribution and violation of drug prescription laws. Medivolix explicitly avoids online ordering, acting solely as a verified availability discovery and communication platform.

---

## 3. Core Principles

- **No Medical Advice**: Medivolix does not diagnose conditions, prescribe medications, or recommend substitutions.
- **Mandatory Disclaimers**: Every listing prominently states: *"Stock information is reported by participating pharmacies and may change. Contact the pharmacy to confirm availability before visiting."*
- **Sellable Stock Rule**: Total quantity reflects only non-expired, sellable batches. Expired batches are automatically quarantined.
- **Role-Based Security**: Strict server-side access control across `CUSTOMER`, `PHARMACY_ADMIN`, and `SYSTEM_ADMIN` roles.

---

## 4. Key User Personas

| Role | Core Responsibilities & Workflows |
|---|---|
| **Customer / Patient** | Search medicines, compare reported stock across nearby pharmacies, view pharmacy contact & location, submit availability confirmation requests, track request updates. |
| **Pharmacy Administrator** | Manage pharmacy profile, register stock items, update unit quantities, record batches and expiry dates, view low-stock alerts, monitor expiring stock, review and update incoming requests. |
| **System Administrator** | Platform governance, review and approve/suspend pharmacy applications, inspect catalog records, view operational database metrics. |

---

## 5. Technology Stack Summary

- **Frontend**: React 18 / 19, Vite, React Router 7, Vanilla CSS Design System, Lucide React icons.
- **Backend**: Core Java 17+, Jakarta Servlet API 6.0, Apache Tomcat 10.1, HikariCP JDBC Connection Pool, Jackson JSON, jBCrypt 0.4.
- **Database**: MySQL 8.x / 9.x, InnoDB Engine, Prepared Statements, Foreign Keys, Referential Integrity, Audit Logging.
- **Architecture**: Decoupled Client-Server architecture communicating over REST-style JSON HTTP APIs with secure session management.
