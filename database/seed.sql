-- ==============================================================================
-- MEDIVOLIX: Demonstration and Testing Seed Data
-- Standard realistic records centered in Jaipur, Jodhpur, Delhi & NCR
-- ==============================================================================

USE medivolix_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE availability_requests;
TRUNCATE TABLE inventory_audit_logs;
TRUNCATE TABLE inventory_batches;
TRUNCATE TABLE pharmacy_inventory;
TRUNCATE TABLE pharmacy_admins;
TRUNCATE TABLE pharmacies;
TRUNCATE TABLE medicines;
TRUNCATE TABLE users;
TRUNCATE TABLE system_settings;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. System Settings
-- ------------------------------------------------------------------------------
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('stock_freshness_hours', '24', 'Threshold in hours before reported stock is categorized as outdated'),
('low_stock_threshold', '10', 'Default threshold for flagging low inventory units'),
('expiry_warning_days', '45', 'Window in days to trigger approaching-expiry warnings')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- ------------------------------------------------------------------------------
-- 2. Users (Development Accounts with Real Common Indian Names)
-- Default passwords:
--   Admin: Admin@1234
--   Pharmacy Admins: Pharmacy@1234
--   Customers: Customer@1234
-- BCrypt format: $2a$10$...
-- ------------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
(1, 'admin@medivolix.com', '$2a$10$35LSsr.sIjBqv2xX87ELV.NCQiaAMg6NlCjY8RDecaF0V/169WNLa', 'Dr. Rajesh Sharma', '+91 98290 00001', 'SYSTEM_ADMIN', 'ACTIVE'),
(2, 'careplus@medivolix.com', '$2a$10$raKoa08htGLJ23.uBM1yauHy/eV3nBabX9TFpVdWywJYy.1mMxk6C', 'Manoj Gehlot (Apollo MI Road, Jaipur)', '+91 98290 11111', 'PHARMACY_ADMIN', 'ACTIVE'),
(3, 'apollo@medivolix.com', '$2a$10$raKoa08htGLJ23.uBM1yauHy/eV3nBabX9TFpVdWywJYy.1mMxk6C', 'Suresh Bishnoi (Marwar Chemist, Jodhpur)', '+91 94141 22222', 'PHARMACY_ADMIN', 'ACTIVE'),
(4, 'medplus@medivolix.com', '$2a$10$raKoa08htGLJ23.uBM1yauHy/eV3nBabX9TFpVdWywJYy.1mMxk6C', 'Amitabh Mathur (Apollo Connaught Place, Delhi)', '+91 98111 33333', 'PHARMACY_ADMIN', 'ACTIVE'),
(5, 'lifecare@medivolix.com', '$2a$10$raKoa08htGLJ23.uBM1yauHy/eV3nBabX9TFpVdWywJYy.1mMxk6C', 'Sunil Rathore (Sanjeevani Medicos, Jaipur)', '+91 98292 44444', 'PHARMACY_ADMIN', 'PENDING'),
(6, 'guardian@medivolix.com', '$2a$10$raKoa08htGLJ23.uBM1yauHy/eV3nBabX9TFpVdWywJYy.1mMxk6C', 'Pooja Aggarwal (Guardian, Lajpat Nagar, Delhi)', '+91 98180 55555', 'PHARMACY_ADMIN', 'ACTIVE'),
(7, 'fortis@medivolix.com', '$2a$10$raKoa08htGLJ23.uBM1yauHy/eV3nBabX9TFpVdWywJYy.1mMxk6C', 'Vikas Chauhan (Fortis Pharmacy, Noida)', '+91 98102 66666', 'PHARMACY_ADMIN', 'ACTIVE'),
(8, 'cybercity@medivolix.com', '$2a$10$raKoa08htGLJ23.uBM1yauHy/eV3nBabX9TFpVdWywJYy.1mMxk6C', 'Deepak Verma (MedPlus Cyber City, Gurugram)', '+91 98105 77777', 'PHARMACY_ADMIN', 'ACTIVE'),
(9, 'john.doe@example.com', '$2a$10$6KJHn19vqEUNN12XjLloTOODBQkMvp6rdbPHu.peG653yTO4xY8km', 'Rahul Sharma', '+91 98280 12345', 'CUSTOMER', 'ACTIVE'),
(10, 'priya.sharma@example.com', '$2a$10$6KJHn19vqEUNN12XjLloTOODBQkMvp6rdbPHu.peG653yTO4xY8km', 'Priya Sharma', '+91 98291 23456', 'CUSTOMER', 'ACTIVE'),
(11, 'amit.patel@example.com', '$2a$10$6KJHn19vqEUNN12XjLloTOODBQkMvp6rdbPHu.peG653yTO4xY8km', 'Amit Patel', '+91 98112 34567', 'CUSTOMER', 'ACTIVE'),
(12, 'sneha.gupta@example.com', '$2a$10$6KJHn19vqEUNN12XjLloTOODBQkMvp6rdbPHu.peG653yTO4xY8km', 'Sneha Gupta', '+91 98188 45678', 'CUSTOMER', 'ACTIVE')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  phone = VALUES(phone),
  status = VALUES(status);

-- ------------------------------------------------------------------------------
-- 3. Pharmacies (Jaipur, Jodhpur, Delhi, Gurugram, Noida, and Nearby Locations)
-- ------------------------------------------------------------------------------
INSERT INTO pharmacies (id, name, license_number, phone, email, address_line1, address_line2, city, state, postal_code, latitude, longitude, operating_hours, status) VALUES
(1, 'Apollo Pharmacy - MI Road', 'RJ-JPR-2023-11024', '+91 141 237 8899', 'careplus@medivolix.com', 'Shop 14-16, Mirza Ismail (MI) Road, Near Panch Batti', 'C-Scheme', 'Jaipur', 'Rajasthan', '302001', 26.918000, 75.811500, '24 Hours', 'APPROVED'),
(2, 'Marwar Chemist & Druggists', 'RJ-JDH-2022-88190', '+91 291 243 5566', 'apollo@medivolix.com', 'Opposite MDM Hospital Emergency Gate, Shastri Nagar', 'Shastri Nagar', 'Jodhpur', 'Rajasthan', '342003', 26.271500, 73.011200, '24 Hours', 'APPROVED'),
(3, 'Apollo Pharmacy - Connaught Place', 'DL-CP-2021-44510', '+91 11 2341 8877', 'medplus@medivolix.com', 'Block E, Radial Road 3, Inner Circle', 'Connaught Place', 'New Delhi', 'Delhi', '110001', 28.631500, 77.216700, '24 Hours', 'APPROVED'),
(4, 'Sanjeevani Medicos & Chemist', 'RJ-JPR-2024-99341', '+91 141 252 4433', 'lifecare@medivolix.com', 'Plot 42, Ghevarchand Market, Malviya Nagar', 'Malviya Nagar', 'Jaipur', 'Rajasthan', '302017', 26.853000, 75.805000, '8:00 AM - 11:00 PM', 'PENDING'),
(5, 'Guardian Pharmacy - Lajpat Nagar', 'DL-SE-2022-77218', '+91 11 2984 6655', 'guardian@medivolix.com', 'Central Market, Ground Floor, F-Block', 'Lajpat Nagar II', 'New Delhi', 'Delhi', '110024', 28.570000, 77.240000, '8:00 AM - 11:00 PM', 'APPROVED'),
(6, 'Fortis Healthworld Pharmacy', 'UP-NOI-2023-66120', '+91 120 430 0200', 'fortis@medivolix.com', 'Near Fortis Hospital, Sector 62', 'Sector 62', 'Noida', 'Uttar Pradesh', '201301', 28.618000, 77.372500, '24 Hours', 'APPROVED'),
(7, 'MedPlus Chemist - DLF Cyber City', 'HR-GGN-2022-55410', '+91 124 456 7890', 'cybercity@medivolix.com', 'Building 10 Tower B Concourse, DLF Phase 2', 'DLF Cyber City', 'Gurugram', 'Haryana', '122002', 28.495000, 77.089000, '8:30 AM - 10:30 PM', 'APPROVED'),
(8, 'Jodhpur Medical Hall', 'RJ-JDH-2021-33491', '+91 291 251 7788', 'jodhpur.med@medivolix.com', 'Circuit House Road, Near High Court Colony', 'Ratanada', 'Jodhpur', 'Rajasthan', '342011', 26.255200, 73.031400, '8:00 AM - 10:00 PM', 'APPROVED'),
(9, 'Sharma Medical & General Store', 'RJ-JPR-2021-22119', '+91 141 262 1122', 'sharma.jaipur@medivolix.com', 'Main Market, Lane 1, Raja Park', 'Raja Park', 'Jaipur', 'Rajasthan', '302004', 26.892000, 75.827000, '8:30 AM - 10:30 PM', 'APPROVED')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  address_line1 = VALUES(address_line1),
  address_line2 = VALUES(address_line2),
  city = VALUES(city),
  state = VALUES(state),
  postal_code = VALUES(postal_code),
  latitude = VALUES(latitude),
  longitude = VALUES(longitude),
  phone = VALUES(phone),
  status = VALUES(status);

-- ------------------------------------------------------------------------------
-- 4. Pharmacy Admins Mapping
-- ------------------------------------------------------------------------------
INSERT INTO pharmacy_admins (id, pharmacy_id, user_id, is_primary) VALUES
(1, 1, 2, TRUE),
(2, 2, 3, TRUE),
(3, 3, 4, TRUE),
(4, 4, 5, TRUE),
(5, 5, 6, TRUE),
(6, 6, 7, TRUE),
(7, 7, 8, TRUE)
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
-- 6. Pharmacy Inventory (Stock across Jaipur, Jodhpur, Delhi, Noida & Gurugram)
-- ------------------------------------------------------------------------------
INSERT INTO pharmacy_inventory (id, pharmacy_id, medicine_id, stock_quantity, price, is_available, low_stock_threshold, last_stock_update) VALUES
-- Apollo Pharmacy - MI Road, Jaipur (Pharmacy 1)
(1, 1, 1, 150, 32.50, TRUE, 20, NOW()),
(2, 1, 2, 45, 205.00, TRUE, 10, NOW()),
(3, 1, 4, 85, 155.00, TRUE, 15, NOW()),
(4, 1, 6, 8, 22.00, TRUE, 15, NOW()), -- Low stock!
(5, 1, 9, 0, 160.00, FALSE, 5, NOW() - INTERVAL 30 HOUR), -- Out of stock & outdated

-- Marwar Chemist - Shastri Nagar, Jodhpur (Pharmacy 2)
(6, 2, 1, 220, 33.00, TRUE, 25, NOW()),
(7, 2, 2, 60, 201.50, TRUE, 10, NOW()),
(8, 2, 3, 50, 122.00, TRUE, 10, NOW()),
(9, 2, 5, 110, 48.00, TRUE, 20, NOW()),
(10, 2, 7, 75, 115.00, TRUE, 15, NOW()),
(11, 2, 10, 95, 24.00, TRUE, 15, NOW()),

-- Apollo Pharmacy - Connaught Place, New Delhi (Pharmacy 3)
(12, 3, 1, 180, 31.50, TRUE, 20, NOW()),
(13, 3, 3, 40, 120.00, TRUE, 10, NOW()),
(14, 3, 4, 60, 152.00, TRUE, 15, NOW()),
(15, 3, 8, 55, 182.00, TRUE, 10, NOW()),
(16, 3, 10, 80, 23.50, TRUE, 15, NOW()),

-- Guardian Pharmacy - Lajpat Nagar, New Delhi (Pharmacy 5)
(17, 5, 1, 90, 32.00, TRUE, 15, NOW()),
(18, 5, 2, 35, 204.00, TRUE, 10, NOW()),
(19, 5, 6, 45, 21.50, TRUE, 10, NOW()),
(20, 5, 9, 25, 162.00, TRUE, 8, NOW()),

-- Fortis Healthworld - Sector 62, Noida (Pharmacy 6)
(21, 6, 2, 70, 202.00, TRUE, 15, NOW()),
(22, 6, 4, 90, 154.00, TRUE, 15, NOW()),
(23, 6, 5, 130, 47.50, TRUE, 20, NOW()),
(24, 6, 7, 65, 114.00, TRUE, 10, NOW()),

-- MedPlus Chemist - DLF Cyber City, Gurugram (Pharmacy 7)
(25, 7, 1, 140, 32.00, TRUE, 20, NOW()),
(26, 7, 3, 60, 121.00, TRUE, 12, NOW()),
(27, 7, 8, 40, 185.00, TRUE, 10, NOW()),
(28, 7, 10, 110, 24.00, TRUE, 20, NOW()),

-- Sharma Medical - Raja Park, Jaipur (Pharmacy 9)
(29, 9, 1, 75, 31.00, TRUE, 15, NOW()),
(30, 9, 4, 45, 150.00, TRUE, 10, NOW()),
(31, 9, 6, 50, 21.00, TRUE, 12, NOW())
ON DUPLICATE KEY UPDATE
  stock_quantity = VALUES(stock_quantity),
  price = VALUES(price),
  is_available = VALUES(is_available);

-- ------------------------------------------------------------------------------
-- 7. Inventory Batches (Batch tracking & Expiry monitoring)
-- ------------------------------------------------------------------------------
INSERT INTO inventory_batches (id, inventory_id, batch_number, quantity, expiry_date, status) VALUES
-- Apollo MI Road Jaipur batches
(1, 1, 'JPR-DOLO-01', 110, DATE_ADD(CURRENT_DATE, INTERVAL 360 DAY), 'ACTIVE'),
(2, 1, 'JPR-DOLO-02', 40, DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY), 'ACTIVE'), -- Approaching expiry!
(3, 2, 'JPR-AUG-01', 45, DATE_ADD(CURRENT_DATE, INTERVAL 180 DAY), 'ACTIVE'),
(4, 3, 'JPR-PAN-01', 85, DATE_ADD(CURRENT_DATE, INTERVAL 240 DAY), 'ACTIVE'),
(5, 4, 'JPR-CET-01', 8, DATE_ADD(CURRENT_DATE, INTERVAL 200 DAY), 'ACTIVE'),

-- Marwar Chemist Jodhpur batches
(6, 6, 'JDH-DOLO-99', 220, DATE_ADD(CURRENT_DATE, INTERVAL 400 DAY), 'ACTIVE'),
(7, 7, 'JDH-AUG-88', 60, DATE_ADD(CURRENT_DATE, INTERVAL 190 DAY), 'ACTIVE'),
(8, 8, 'JDH-AZI-77', 50, DATE_ADD(CURRENT_DATE, INTERVAL 300 DAY), 'ACTIVE'),
(9, 9, 'JDH-GLY-66', 110, DATE_ADD(CURRENT_DATE, INTERVAL 500 DAY), 'ACTIVE'),
(10, 10, 'JDH-TEL-55', 75, DATE_ADD(CURRENT_DATE, INTERVAL 320 DAY), 'ACTIVE'),
(11, 11, 'JDH-ELE-44', 95, DATE_ADD(CURRENT_DATE, INTERVAL 700 DAY), 'ACTIVE'),

-- Apollo Connaught Place Delhi batches
(12, 12, 'DEL-DOLO-11', 180, DATE_ADD(CURRENT_DATE, INTERVAL 350 DAY), 'ACTIVE'),
(13, 13, 'DEL-AZI-22', 40, DATE_ADD(CURRENT_DATE, INTERVAL 280 DAY), 'ACTIVE'),
(14, 14, 'DEL-PAN-33', 60, DATE_ADD(CURRENT_DATE, INTERVAL 210 DAY), 'ACTIVE'),
(15, 15, 'DEL-MON-44', 55, DATE_ADD(CURRENT_DATE, INTERVAL 420 DAY), 'ACTIVE')
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- ------------------------------------------------------------------------------
-- 8. Availability Requests (Inquiries from Real Indian Patients)
-- ------------------------------------------------------------------------------
INSERT INTO availability_requests (id, customer_id, pharmacy_id, medicine_id, requested_quantity, customer_notes, status, pharmacy_notes, created_at) VALUES
(1, 9, 1, 1, 2, 'Need Dolo 650 urgently for elderly father fever relief in C-Scheme, Jaipur.', 'CONFIRMED', 'Stock verified at MI Road store and kept aside for 3 hours.', NOW() - INTERVAL 2 HOUR),
(2, 9, 1, 2, 1, 'Doctor prescribed Augmentin 625 Duo for chest infection. I have valid prescription.', 'PENDING', NULL, NOW() - INTERVAL 45 MINUTE),
(3, 10, 2, 8, 1, 'Inquiring if Montair-LC strip of 10 is available near MDM Hospital, Jodhpur today.', 'CONFIRMED', 'Yes, available in store. Please bring your prescription.', NOW() - INTERVAL 4 HOUR),
(4, 10, 1, 9, 1, 'Need Asthalin inhaler refill today in Jaipur.', 'UNAVAILABLE', 'Currently out of stock. New distributor shipment expected Tuesday.', NOW() - INTERVAL 1 DAY),
(5, 11, 3, 3, 2, 'Urgent inquiry for Azithral 500mg in Connaught Place, New Delhi.', 'CONFIRMED', 'Pack of 2 verified and ready for pickup at billing counter.', NOW() - INTERVAL 1 HOUR),
(6, 12, 6, 5, 2, 'Need Glycomet 500 SR tablets refill in Sector 62, Noida.', 'PENDING', NULL, NOW() - INTERVAL 30 MINUTE)
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- ------------------------------------------------------------------------------
-- 9. Audit Logs
-- ------------------------------------------------------------------------------
INSERT INTO inventory_audit_logs (pharmacy_id, medicine_id, user_id, action, quantity_change, previous_quantity, new_quantity, details, created_at) VALUES
(1, 1, 2, 'STOCK_ADD', 150, 0, 150, 'Initial inventory setup for Dolo 650 at Apollo MI Road, Jaipur', NOW() - INTERVAL 5 DAY),
(1, 2, 2, 'STOCK_ADD', 45, 0, 45, 'Initial stock entry for Augmentin 625 Duo', NOW() - INTERVAL 5 DAY),
(1, 4, 2, 'STOCK_UPDATE', -5, 13, 8, 'Cycle count adjustment for Cetzine 10', NOW() - INTERVAL 1 DAY),
(2, 1, 3, 'STOCK_ADD', 220, 0, 220, 'Shipment intake for Dolo 650 at Marwar Chemist, Jodhpur', NOW() - INTERVAL 3 DAY),
(3, 1, 4, 'STOCK_ADD', 180, 0, 180, 'Distributor arrival at Apollo Connaught Place, Delhi', NOW() - INTERVAL 2 DAY);
