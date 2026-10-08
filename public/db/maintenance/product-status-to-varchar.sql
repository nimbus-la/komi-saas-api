-- ============================================
-- Estado del producto: de booleano a texto
--
-- product_status pasó de BOOLEAN a los valores de EntityStatus (ACTIVE,
-- INACTIVE, ARCHIVED, DELETED). Una base creada desde cero ya lo trae así por
-- tables/products.sql; este archivo es para convertir una base existente.
--
-- Se corre una sola vez, a mano:
--   docker exec -i erp_postgres psql -U erp_user -d erp < public/db/maintenance/product-status-to-varchar.sql
-- ============================================

BEGIN;

ALTER TABLE product ALTER COLUMN product_status DROP DEFAULT;

ALTER TABLE product ALTER COLUMN product_status TYPE VARCHAR(20)
    USING CASE WHEN product_status THEN 'ACTIVE' ELSE 'INACTIVE' END;

ALTER TABLE product ALTER COLUMN product_status SET DEFAULT 'ACTIVE';

ALTER TABLE product ADD CONSTRAINT chk_product_status
    CHECK (product_status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'DELETED'));

COMMIT;
