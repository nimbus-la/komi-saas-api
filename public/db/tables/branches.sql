-- ============================================
-- TABLA DE BRANCHES
-- ============================================
-- Se incluye desde 01-init.sql con \ir, después de tenants y antes de users e
-- inventario, que tienen llaves foráneas hacia esta tabla. Está en una
-- subcarpeta para que Postgres no la ejecute por su cuenta al iniciar.
--
-- Una sucursal eliminada no se borra: se marca con branch_is_deleted, porque
-- users, inventory_batchs e inventory_movements la siguen referenciando.
CREATE TABLE IF NOT EXISTS branches (
    branch_id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    branch_name VARCHAR(120) NOT NULL,
    branch_address VARCHAR(225) NOT NULL,
    branch_phone VARCHAR(20) NOT NULL,
    branch_city VARCHAR(120) NOT NULL,
    branch_department VARCHAR(120) NOT NULL,
    branch_is_active BOOLEAN NOT NULL DEFAULT TRUE,
    branch_is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    branch_created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    branch_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_branch_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants (tenant_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
