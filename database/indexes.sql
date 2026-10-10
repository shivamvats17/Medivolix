-- ==============================================================================
-- MEDIVOLIX: Additional Database Indexes for Fast Search and Geo Queries
-- ==============================================================================

USE medivolix_db;

-- Optimized indexes for high-throughput search queries
-- Note: schema.sql already defines primary foreign keys and column indexes.
-- The following are composite indexes for complex filtering.

-- Procedure to safely add indexes if they do not already exist
DROP PROCEDURE IF EXISTS AddIndexIfNotExists;

DELIMITER $$
CREATE PROCEDURE AddIndexIfNotExists(
    IN tableName VARCHAR(64),
    IN indexName VARCHAR(64),
    IN indexColumns VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = tableName
          AND index_name = indexName
    ) THEN
        SET @sqlStatement = CONCAT('CREATE INDEX ', indexName, ' ON ', tableName, ' (', indexColumns, ')');
        PREPARE stmt FROM @sqlStatement;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- Call procedure for composite indexes
CALL AddIndexIfNotExists('medicines', 'idx_med_composite_search', 'name, brand_name, generic_name');
CALL AddIndexIfNotExists('pharmacy_inventory', 'idx_inv_med_avail', 'medicine_id, is_available, stock_quantity');
CALL AddIndexIfNotExists('pharmacies', 'idx_pharmacy_geo_status', 'status, city');
CALL AddIndexIfNotExists('availability_requests', 'idx_req_cust_recent', 'customer_id, created_at');
CALL AddIndexIfNotExists('availability_requests', 'idx_req_pharm_status', 'pharmacy_id, status');

DROP PROCEDURE IF EXISTS AddIndexIfNotExists;
