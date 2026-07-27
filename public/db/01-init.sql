
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

-- ============================================
-- TABLA DE ROLES
-- ============================================
CREATE TABLE roles (
    role_id UUID PRIMARY KEY,
    role_code VARCHAR(20) NOT NULL UNIQUE,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- ============================================
-- TABLA DE USERS
-- ============================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    branch_id UUID NOT NULL,
    rol_id UUID NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    user_email VARCHAR(120) NOT NULL,
    user_password VARCHAR(100) NOT NULL,
    user_full_name VARCHAR(120) NOT NULL,
    user_last_name VARCHAR(120) NOT NULL,
    user_age DATE NOT NULL,
    user_sex VARCHAR(20) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    user_is_active BOOLEAN NOT NULL DEFAULT TRUE,
    user_created_at TIMESTAMPTZ NOT NULL,
    user_updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT fk_users_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_users_rol
        FOREIGN KEY (rol_id)
        REFERENCES roles(rol_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT uq_users_username UNIQUE (user_name),
    CONSTRAINT uq_users_email UNIQUE (user_email)
);

-- --------------------------------------------------------------------------
-- Secuencia para el consecutivo del SKU (INV-0001, INV-0002, ...)
-- --------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS inventory_item_sku_seq START 1;
CREATE SEQUENCE IF NOT EXISTS product_sku_seq START 1;



-- --------------------------------------------------------------------------
-- Tabla: inventory_items
--   FK: tenant_id -> tenants(tenant_id)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_items (
    inventory_item_id  UUID           PRIMARY KEY,
    sku                VARCHAR(20)    NOT NULL UNIQUE,
    tenant_id          UUID           NOT NULL,
    name               VARCHAR(120)   NOT NULL,
    unit_of_measure    VARCHAR(20)    NOT NULL,
    is_perishable      BOOLEAN        NOT NULL,
    is_active          BOOLEAN        NOT NULL DEFAULT TRUE,
    min_global_stock   NUMERIC(14,3)  NULL,
    created_at         TIMESTAMPTZ    NOT NULL,
    updated_at         TIMESTAMPTZ    NOT NULL,

    CONSTRAINT fk_inventory_items_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants (tenant_id)
        ON DELETE RESTRICT
);

-- El inventario casi siempre se consulta filtrando por tenant.
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant
    ON inventory_items (tenant_id);



-- --------------------------------------------------------------------------
-- Tabla: inventory_batchs
--   FK: inventory_item_id -> inventory_items(inventory_item_id)
--   FK: branch_id         -> branches(branch_id)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_batchs (
    inventory_batch_id  UUID           PRIMARY KEY,
    inventory_item_id   UUID           NOT NULL,
    branch_id           UUID           NOT NULL,
    quantity_received   NUMERIC(14, 3) NOT NULL,
    quantity_remaining  NUMERIC(14, 3) NOT NULL,
    unit_cost_amount    NUMERIC(12, 2) NOT NULL,
    unit_cost_currency  VARCHAR(3)     NOT NULL,
    expiration_date     TIMESTAMPTZ    NULL,
    received_at         TIMESTAMPTZ    NOT NULL,

    CONSTRAINT fk_inventory_batchs_item
        FOREIGN KEY (inventory_item_id)
        REFERENCES inventory_items (inventory_item_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_inventory_batchs_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches (branch_id)
        ON DELETE RESTRICT
);

-- El lote se consulta filtrando por item y, ahora, por sucursal.
CREATE INDEX IF NOT EXISTS idx_inventory_batchs_item
    ON inventory_batchs (inventory_item_id);

CREATE INDEX IF NOT EXISTS idx_inventory_batchs_branch
    ON inventory_batchs (branch_id);



CREATE TABLE inventory_branch_configs (
    inventory_branch_config_id uuid PRIMARY KEY,
    inventory_item_id          uuid NOT NULL REFERENCES inventory_items (inventory_item_id),
    branch_id                  uuid NOT NULL,
    min_stock                  numeric(14,3) NOT NULL,
    CONSTRAINT uq_inventory_branch_configs_item_branch UNIQUE (inventory_item_id, branch_id)
);

CREATE INDEX idx_inventory_branch_configs_item ON inventory_branch_configs (inventory_item_id);



-- --------------------------------------------------------------------------
-- Tabla: inventory_movements
--   Bitácora append-only de cambios de cantidad (entradas, salidas, mermas,
--   ajustes). No se edita ni se borra: una correccion es un movimiento nuevo.
--   FK: inventory_item_id -> inventory_items(inventory_item_id)
--   FK: branch_id         -> branches(branch_id)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_movements (
    inventory_movement_id  UUID           PRIMARY KEY,
    tenant_id              UUID           NOT NULL,
    inventory_item_id      UUID           NOT NULL,
    branch_id              UUID           NOT NULL,
    batch_id               UUID           NULL,
    movement_type          VARCHAR(20)    NOT NULL,
    quantity               NUMERIC(14, 3) NOT NULL,
    unit_cost_amount       NUMERIC(12, 2) NULL,
    unit_cost_currency     VARCHAR(3)     NULL,
    reason                 VARCHAR(255)   NULL,
    -- user_id             UUID           NULL,   -- pendiente: modulo de auth
    occurred_at            TIMESTAMPTZ    NOT NULL,
    registered_at          TIMESTAMPTZ    NOT NULL,

    CONSTRAINT fk_inventory_movements_item
        FOREIGN KEY (inventory_item_id)
        REFERENCES inventory_items (inventory_item_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_inventory_movements_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches (branch_id)
        ON DELETE RESTRICT
);

-- La bitacora se consulta filtrando por item y sucursal, y ordenada por fecha.
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_branch
    ON inventory_movements (inventory_item_id, branch_id);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_occurred
    ON inventory_movements (occurred_at);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_tenant
    ON inventory_movements (tenant_id);

-- ============================================
-- SECUENCIA PARA SKU DE PRODUCTOS
-- ============================================
CREATE SEQUENCE IF NOT EXISTS product_sku_seq
    START WITH 1
    INCREMENT BY 1;


-- ============================================
-- TABLA DE CATEGORÍAS
-- ============================================
CREATE TABLE IF NOT EXISTS product_category (
    id UUID PRIMARY KEY,

    tenant_id UUID NOT NULL
        REFERENCES tenants(tenant_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    name VARCHAR(150) NOT NULL,
    description TEXT,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_category_tenant
    ON product_category (tenant_id);

CREATE INDEX IF NOT EXISTS idx_product_category_name
    ON product_category (name);


-- ============================================
-- TABLA DE PRODUCTOS
-- ============================================
CREATE TABLE IF NOT EXISTS product (
    product_id UUID PRIMARY KEY,

    tenant_id UUID NOT NULL
        REFERENCES tenants(tenant_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    product_category_id UUID NOT NULL
        REFERENCES product_category(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    product_name VARCHAR(120) NOT NULL,
    product_description TEXT,
    product_base_price NUMERIC(12,2) NOT NULL,
    profit_margin NUMERIC(5,2) NOT NULL,
    product_status BOOLEAN NOT NULL DEFAULT TRUE,
    product_img_url TEXT,
    product_sku_seq VARCHAR(50) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_tenant
    ON product (tenant_id);

CREATE INDEX IF NOT EXISTS idx_product_category
    ON product (product_category_id);

CREATE INDEX IF NOT EXISTS idx_product_name
    ON product (product_name);


-- ============================================
-- TABLA DE INGREDIENTES DE RECETA
-- ============================================
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_ingredient_id UUID PRIMARY KEY,

    product_id UUID NOT NULL
        REFERENCES product(product_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    inventory_item_id UUID NOT NULL
        REFERENCES inventory_items(inventory_item_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    quantity NUMERIC(14,3) NOT NULL,
    is_optional BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_product
    ON recipe_ingredients (product_id);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_inventory_item
    ON recipe_ingredients (inventory_item_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_recipe_ingredients_product_inventory
    ON recipe_ingredients (product_id, inventory_item_id);