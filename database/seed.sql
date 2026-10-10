-- ==============================================================================
-- MEDIVOLIX: Demonstration and Testing Seed Data
-- Clearly marked demonstration records for local development & evaluation.
-- ==============================================================================

USE medivolix_db;

-- ------------------------------------------------------------------------------
-- 1. System Settings
-- ------------------------------------------------------------------------------
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('stock_freshness_hours', '24', 'Threshold in hours before reported stock is categorized as outdated'),
('low_stock_threshold', '10', 'Default threshold for flagging low inventory units'),
('expiry_warning_days', '45', 'Window in days to trigger approaching-expiry warnings')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- ------------------------------------------------------------------------------
-- 2. Users (Development Accounts)
-- Password for all seed accounts is:
--   Admin: Admin@1234
--   Pharmacy Admins: Pharmacy@1234
--   Customers: Customer@1234
-- BCrypt format: $2a$10$...
-- ------------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
(1, 'admin@medivolix.com', '$2a$10$35LSsr.sIjBqv2xX87ELV.NCQiaAMg6NlCjY8RDecaF0V/169WNLa', 'Medivolix Admin', '+91 98765 00001', 'SYSTEM_ADMIN', 'ACTIVE'),
(2, 'careplus@medivolix.com', '$2a$10$raKoa08htGLJ23.uBM1yauHy/eV3nBabX9TFpVdWywJYy.1mMxk6C', 'Ramesh Rao (CarePlus)', '+91 98765 11111', 'PHARMACY_ADMIN', 'ACTIVE'),
(3, 'apollo@medivolix.com', '$2a$10$raKoa08htGLJ23.uBM1yauHy/eV3nBabX9TFpVdWywJYy.1mMxk6C', 'Suresh Kumar (Apollo)', '+91 98765 22222', 'PHARMACY_ADMIN', 'ACTIVE'),
(4, 'medplus@medivolix.com', '$2a$10$raKoa08htGLJ23.uBM1yauHy/eV3nBabX9TFpVdWywJYy.1mMxk6C', 'Anil Verma (MedPlus)', '+91 98765 33333', 'PHARMACY_ADMIN', 'ACTIVE'),
(5, 'lifecare@medivolix.com', '$2a$10$raKoa08htGLJ23.uBM1yauHy/eV3nBabX9TFpVdWywJYy.1mMxk6C', 'Sunil Mehta (LifeCare)', '+91 98765 44444', 'PHARMACY_ADMIN', 'PENDING'),
(6, 'john.doe@example.com', '$2a$10$6KJHn19vqEUNN12XjLloTOODBQkMvp6rdbPHu.peG653yTO4xY8km', 'John Doe', '+91 91234 56789', 'CUSTOMER', 'ACTIVE'),
(7, 'priya.sharma@example.com', '$2a$10$6KJHn19vqEUNN12XjLloTOODBQkMvp6rdbPHu.peG653yTO4xY8km', 'Priya Sharma', '+91 99887 76655', 'CUSTOMER', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- ------------------------------------------------------------------------------
-- 3. Pharmacies
-- ------------------------------------------------------------------------------
INSERT INTO pharmacies (id, name, license_number, phone, email, address_line1, address_line2, city, state, postal_code, latitude, longitude, operating_hours, status) VALUES
(1, 'CarePlus Pharmacy', 'KA-BLR-2023-44102', '+91 80 2525 1122', 'careplus@medivolix.com', '102 100ft Road, 4th Block', 'Indiranagar', 'Bengaluru', 'Karnataka', '560038', 12.971891, 77.641154, '8:00 AM - 10:00 PM', 'APPROVED'),
(2, 'Apollo Pharmacy - Koramangala', 'KA-BLR-2021-11890', '+91 80 4112 3344', 'apollo@medivolix.com', 'Plot 54, 80 Feet Road, 6th Block', 'Koramangala', 'Bengaluru', 'Karnataka', '560095', 12.935242, 77.624510, '24 Hours', 'APPROVED'),
(3, 'MedPlus Pharmacy - HSR', 'KA-BLR-2022-88712', '+91 80 6554 9900', 'medplus@medivolix.com', 'Sector 1, 14th Main Road', 'HSR Layout', 'Bengaluru', 'Karnataka', '560102', 12.912118, 77.644554, '8:30 AM - 10:30 PM', 'APPROVED'),
(4, 'LifeCare Chemist', 'KA-BLR-2024-99123', '+91 80 8877 6655', 'lifecare@medivolix.com', '24 ITPL Main Road', 'Whitefield', 'Bengaluru', 'Karnataka', '560066', 12.969812, 77.749924, '9:00 AM - 9:00 PM', 'PENDING')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ------------------------------------------------------------------------------
-- 4. Pharmacy Admins Mapping
-- ------------------------------------------------------------------------------
INSERT INTO pharmacy_admins (id, pharmacy_id, user_id, is_primary) VALUES
(1, 1, 2, TRUE),
(2, 2, 3, TRUE),
(3, 3, 4, TRUE),
(4, 4, 5, TRUE)
ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary);

-- ------------------------------------------------------------------------------
-- 5. Standard Medicines Catalog
-- ------------------------------------------------------------------------------
INSERT INTO medicines (id, name, brand_name, generic_name, strength, dosage_form, manufacturer, prescription_required, description, category) VALUES
(1, 'Paracetamol 650mg Tablets', 'Dolo 650', 'Paracetamol (Acetaminophen)', '650 mg', 'Tablet', 'Micro Labs Ltd', FALSE, 'Antipyretic and analgesic used for fever relief and mild-to-moderate pain management.', 'Analgesics / Antipyretics'),
(2, 'Amoxicillin and Potassium Clavulanate Tablets', 'Augmentin 625 Duo', 'Amoxicillin + Potassium Clavulanate', '500 mg + 125 mg', 'Tablet', 'GlaxoSmithKline Pharmaceuticals Ltd', TRUE, 'Broad-spectrum penicillin antibiotic indicated for bacterial infections of ears, respiratory tract, and skin.', 'Antibiotics'),
(3, 'Azithromycin Tablets 500mg', 'Azithral 500', 'Azithromycin', '500 mg', 'Tablet', 'Alembic Pharmaceuticals Ltd', TRUE, 'Macrolide antibiotic used for respiratory tract, skin, and soft tissue bacterial infections.', 'Antibiotics'),
(4, 'Pantoprazole Gastro-Resistant Tablets', 'Pan 40', 'Pantoprazole Sodium', '40 mg', 'Tablet', 'Alkem Laboratories Ltd', TRUE, 'Proton pump inhibitor that decreases the amount of acid produced in the stomach.', 'Gastrointestinal'),
(5, 'Metformin Hydrochloride Prolonged-Release', 'Glycomet 500 SR', 'Metformin Hydrochloride', '500 mg', 'Tablet', 'USV Private Ltd', TRUE, 'Biguanide antihyperglycemic agent for managing type 2 diabetes mellitus.', 'Antidiabetic'),
(6, 'Cetirizine Hydrochloride Tablets 10mg', 'Cetzine 10', 'Cetirizine Hydrochloride', '10 mg', 'Tablet', 'Dr. Reddy Laboratories Ltd', FALSE, 'Second-generation antihistamine used to relieve allergy symptoms such as sneezing and runny nose.', 'Antihistamines'),
(7, 'Telmisartan Tablets 40mg', 'Telma 40', 'Telmisartan', '40 mg', 'Tablet', 'Glenmark Pharmaceuticals Ltd', TRUE, 'Angiotensin II receptor antagonist used in the management of hypertension.', 'Cardiovascular'),
(8, 'Montelukast and Levocetirizine Tablets', 'Montair-LC', 'Montelukast Sodium + Levocetirizine', '10 mg + 5 mg', 'Tablet', 'Cipla Ltd', TRUE, 'Combination leukotriene receptor antagonist and antihistamine for allergic rhinitis and asthma symptoms.', 'Respiratory'),
(9, 'Salbutamol Inhaler 100mcg', 'Asthalin Inhaler', 'Salbutamol (Albuterol)', '100 mcg per actuation', 'Inhaler', 'Cipla Ltd', TRUE, 'Short-acting beta-2 adrenergic agonist for rapid relief of bronchospasm in asthma and COPD.', 'Respiratory'),
(10, 'Oral Rehydration Salts Powder', 'Electral Sachet', 'Sodium Chloride, Potassium Chloride, Sodium Citrate, Dextrose', '21.8 g sachet', 'Powder', 'FDC Ltd', FALSE, 'WHO-recommended oral rehydration salts formulation for restoration of fluid and electrolyte loss.', 'Electrolytes')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ------------------------------------------------------------------------------
-- 6. Pharmacy Inventory
-- ------------------------------------------------------------------------------
INSERT INTO pharmacy_inventory (id, pharmacy_id, medicine_id, stock_quantity, price, is_available, low_stock_threshold, last_stock_update) VALUES
-- CarePlus Pharmacy (Pharmacy 1)
(1, 1, 1, 140, 32.50, TRUE, 20, NOW()),
(2, 1, 2, 45, 205.00, TRUE, 10, NOW()),
(3, 1, 4, 80, 155.00, TRUE, 15, NOW()),
(4, 1, 6, 8, 22.00, TRUE, 15, NOW()), -- Low stock!
(5, 1, 9, 0, 160.00, FALSE, 5, NOW() - INTERVAL 30 HOUR), -- Out of stock & outdated

-- Apollo Pharmacy (Pharmacy 2)
(6, 2, 1, 220, 33.00, TRUE, 25, NOW()),
(7, 2, 2, 60, 201.50, TRUE, 10, NOW()),
(8, 2, 3, 50, 122.00, TRUE, 10, NOW()),
(9, 2, 5, 110, 48.00, TRUE, 20, NOW()),
(10, 2, 7, 75, 115.00, TRUE, 15, NOW()),
(11, 2, 10, 95, 24.00, TRUE, 15, NOW()),

-- MedPlus Pharmacy (Pharmacy 3)
(12, 3, 1, 50, 31.00, TRUE, 15, NOW() - INTERVAL 48 HOUR), -- Outdated timestamp (>24h)
(13, 3, 4, 30, 150.00, TRUE, 10, NOW()),
(14, 3, 8, 40, 185.00, TRUE, 10, NOW()),
(15, 3, 10, 60, 23.50, TRUE, 15, NOW())
ON DUPLICATE KEY UPDATE stock_quantity = VALUES(stock_quantity);

-- ------------------------------------------------------------------------------
-- 7. Inventory Batches (Batch tracking & Expiry monitoring)
-- ------------------------------------------------------------------------------
INSERT INTO inventory_batches (id, inventory_id, batch_number, quantity, expiry_date, status) VALUES
-- CarePlus batches
(1, 1, 'CP-DOLO-01', 100, DATE_ADD(CURRENT_DATE, INTERVAL 360 DAY), 'ACTIVE'),
(2, 1, 'CP-DOLO-02', 40, DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY), 'ACTIVE'), -- Approaching expiry!
(3, 2, 'CP-AUG-01', 45, DATE_ADD(CURRENT_DATE, INTERVAL 180 DAY), 'ACTIVE'),
(4, 3, 'CP-PAN-01', 80, DATE_ADD(CURRENT_DATE, INTERVAL 240 DAY), 'ACTIVE'),
(5, 4, 'CP-CET-01', 8, DATE_ADD(CURRENT_DATE, INTERVAL 200 DAY), 'ACTIVE'),

-- Apollo batches
(6, 6, 'AP-DOLO-99', 220, DATE_ADD(CURRENT_DATE, INTERVAL 400 DAY), 'ACTIVE'),
(7, 7, 'AP-AUG-88', 60, DATE_ADD(CURRENT_DATE, INTERVAL 190 DAY), 'ACTIVE'),
(8, 8, 'AP-AZI-77', 50, DATE_ADD(CURRENT_DATE, INTERVAL 300 DAY), 'ACTIVE'),
(9, 9, 'AP-GLY-66', 110, DATE_ADD(CURRENT_DATE, INTERVAL 500 DAY), 'ACTIVE'),
(10, 10, 'AP-TEL-55', 75, DATE_ADD(CURRENT_DATE, INTERVAL 320 DAY), 'ACTIVE'),
(11, 11, 'AP-ELE-44', 95, DATE_ADD(CURRENT_DATE, INTERVAL 700 DAY), 'ACTIVE'),

-- MedPlus batches
(12, 12, 'MP-DOLO-11', 50, DATE_ADD(CURRENT_DATE, INTERVAL 150 DAY), 'ACTIVE'),
(13, 13, 'MP-PAN-22', 30, DATE_ADD(CURRENT_DATE, INTERVAL 220 DAY), 'ACTIVE'),
(14, 14, 'MP-MON-33', 40, DATE_ADD(CURRENT_DATE, INTERVAL 340 DAY), 'ACTIVE'),
(15, 15, 'MP-ELE-44', 60, DATE_ADD(CURRENT_DATE, INTERVAL 450 DAY), 'ACTIVE')
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- ------------------------------------------------------------------------------
-- 8. Availability Requests
-- ------------------------------------------------------------------------------
INSERT INTO availability_requests (id, customer_id, pharmacy_id, medicine_id, requested_quantity, customer_notes, status, pharmacy_notes, created_at) VALUES
(1, 6, 1, 1, 2, 'Need urgently for elderly patient fever relief.', 'CONFIRMED', 'Stock verified and kept aside for 3 hours.', NOW() - INTERVAL 2 HOUR),
(2, 6, 1, 2, 1, 'Doctor prescribed for ear infection. I have a valid prescription.', 'PENDING', NULL, NOW() - INTERVAL 45 MINUTE),
(3, 7, 2, 8, 1, 'Inquiring if Montair-LC strip of 10 is available today.', 'CONFIRMED', 'Yes, available in store. Please bring your prescription.', NOW() - INTERVAL 4 HOUR),
(4, 7, 1, 9, 1, 'Need Asthalin inhaler refill today.', 'UNAVAILABLE', 'Currently out of stock. New distributor shipment expected Tuesday.', NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- ------------------------------------------------------------------------------
-- 9. Audit Logs
-- ------------------------------------------------------------------------------
INSERT INTO inventory_audit_logs (pharmacy_id, medicine_id, user_id, action, quantity_change, previous_quantity, new_quantity, details, created_at) VALUES
(1, 1, 2, 'STOCK_ADD', 140, 0, 140, 'Initial inventory setup for Dolo 650', NOW() - INTERVAL 5 DAY),
(1, 2, 2, 'STOCK_ADD', 45, 0, 45, 'Initial stock entry for Augmentin 625 Duo', NOW() - INTERVAL 5 DAY),
(1, 4, 2, 'STOCK_UPDATE', -5, 13, 8, 'Routine cycle count adjustment for Cetzine 10', NOW() - INTERVAL 1 DAY);
