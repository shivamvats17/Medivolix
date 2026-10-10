-- ==============================================================================
-- MEDIVOLIX: Medicine Availability & Pharmacy Finder
-- Database Schema Definition (MySQL 8.x / 9.x Compatible)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS medivolix_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medivolix_db;

-- ------------------------------------------------------------------------------
-- 1. Table: users
-- Stores all platform accounts: CUSTOMER, PHARMACY_ADMIN, SYSTEM_ADMIN
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('CUSTOMER', 'PHARMACY_ADMIN', 'SYSTEM_ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    status ENUM('ACTIVE', 'SUSPENDED', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role),
    INDEX idx_user_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 2. Table: pharmacies
-- Stores registered and verified physical pharmacies
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pharmacies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    operating_hours VARCHAR(150) DEFAULT '9:00 AM - 9:00 PM',
    status ENUM('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pharmacy_status (status),
    INDEX idx_pharmacy_city (city),
    INDEX idx_pharmacy_postal (postal_code)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 3. Table: pharmacy_admins
-- Maps PHARMACY_ADMIN users to their managed pharmacy
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pharmacy_admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pharmacy_id INT NOT NULL,
    user_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pa_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    CONSTRAINT fk_pa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_pharmacy_user (pharmacy_id, user_id),
    INDEX idx_pa_user (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 4. Table: medicines
-- Standard catalog of medicines with generic, brand, and dosage details
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    brand_name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(200) NOT NULL,
    strength VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(150),
    prescription_required BOOLEAN DEFAULT FALSE,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_medicine_name (name),
    INDEX idx_medicine_brand (brand_name),
    INDEX idx_medicine_generic (generic_name),
    INDEX idx_medicine_category (category)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 5. Table: pharmacy_inventory
-- Live stock reported by pharmacies for specific catalog medicines
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pharmacy_id INT NOT NULL,
    medicine_id INT NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    low_stock_threshold INT DEFAULT 10,
    last_stock_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    UNIQUE KEY uq_pharmacy_medicine (pharmacy_id, medicine_id),
    INDEX idx_inv_pharmacy_id (pharmacy_id),
    INDEX idx_inv_medicine_id (medicine_id),
    INDEX idx_inv_stock_update (last_stock_update)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 6. Table: inventory_batches
-- Batch-level expiry and stock tracking to derive safe, sellable stock
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    expiry_date DATE NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'DEPLETED', 'QUARANTINED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_batch_inventory FOREIGN KEY (inventory_id) REFERENCES pharmacy_inventory(id) ON DELETE CASCADE,
    INDEX idx_batch_inventory_id (inventory_id),
    INDEX idx_batch_expiry_date (expiry_date),
    INDEX idx_batch_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 7. Table: availability_requests
-- Customer-initiated inquiries for confirmed availability before visiting
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS availability_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    pharmacy_id INT NOT NULL,
    medicine_id INT NOT NULL,
    requested_quantity INT NOT NULL DEFAULT 1,
    customer_notes TEXT,
    status ENUM('PENDING', 'CONFIRMED', 'UNAVAILABLE', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    pharmacy_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_req_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    INDEX idx_req_customer_id (customer_id),
    INDEX idx_req_pharmacy_id (pharmacy_id),
    INDEX idx_req_medicine_id (medicine_id),
    INDEX idx_req_status (status),
    INDEX idx_req_created_at (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 8. Table: inventory_audit_logs
-- Immutable audit log of stock changes for accountability
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pharmacy_id INT NOT NULL,
    medicine_id INT NOT NULL,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    quantity_change INT DEFAULT 0,
    previous_quantity INT DEFAULT 0,
    new_quantity INT DEFAULT 0,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_audit_pharmacy_id (pharmacy_id),
    INDEX idx_audit_created_at (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 9. Table: system_settings
-- Configurable platform thresholds (stock freshness, warning thresholds)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
