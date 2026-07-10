-- ============================================
-- TABLA DE TENANTS
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY,

    account_id UUID NOT NULL,

    tenant_name VARCHAR(120) NOT NULL,

    tenant_description VARCHAR(225) NOT NULL,

    tenant_slug VARCHAR(120) NOT NULL UNIQUE,

    tenant_nit VARCHAR(20) NOT NULL UNIQUE,

    tenant_is_active BOOLEAN NOT NULL DEFAULT TRUE,

    tenant_created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    tenant_updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLA DE BRANCHES
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
    branch_id UUID PRIMARY KEY,

    tenant_id UUID NOT NULL,

    branch_name VARCHAR(120) NOT NULL,

    branch_address VARCHAR(225) NOT NULL,

    branch_phone VARCHAR(20) NOT NULL,

    branch_city VARCHAR(120) NOT NULL,

    branch_department VARCHAR(120) NOT NULL,

    branch_is_active BOOLEAN NOT NULL DEFAULT TRUE,

    branch_created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    branch_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_branch_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants (tenant_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);