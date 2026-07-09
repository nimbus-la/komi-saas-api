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
    cost_amount        NUMERIC(12, 2) NOT NULL,
    cost_currency      VARCHAR(3)     NOT NULL,
    is_perishable      BOOLEAN        NOT NULL,
    is_active          BOOLEAN        NOT NULL DEFAULT TRUE,
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
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_batchs (
    inventory_batch_id  UUID           PRIMARY KEY,
    inventory_item_id   UUID           NOT NULL,
    quantity_received   NUMERIC(14, 3) NOT NULL,
    quantity_remaining  NUMERIC(14, 3) NOT NULL,
    unit_cost_amount    NUMERIC(12, 2) NOT NULL,
    unit_cost_currency  VARCHAR(3)     NOT NULL,
    expiration_date     TIMESTAMPTZ    NULL,
    received_at         TIMESTAMPTZ    NOT NULL,

    CONSTRAINT fk_inventory_batchs_item
        FOREIGN KEY (inventory_item_id)
        REFERENCES inventory_items (inventory_item_id)
        ON DELETE RESTRICT
);


-- El lote casi siempre se consulta filtrando por su item.
CREATE INDEX IF NOT EXISTS idx_inventory_batchs_item
    ON inventory_batchs (inventory_item_id);



CREATE SEQUENCE IF NOT EXISTS product_sku_seq START 1;


-- ============================================
-- TABLA DE CATEGORÍAS
-- ============================================
CREATE TABLE IF NOT EXISTS product_category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);



-- ============================================
-- TABLA DE PRODUCTOS
-- ============================================
CREATE TABLE IF NOT EXISTS product (
    product_id UUID PRIMARY KEY,
    product_category_id UUID NOT NULL,
    product_name VARCHAR(120) NOT NULL,
    product_description TEXT,
    product_base_price NUMERIC(12,2) NOT NULL,
    profit_margin NUMERIC(5,2) NOT NULL,
    product_status BOOLEAN NOT NULL DEFAULT TRUE,
    product_img_url TEXT,
    product_sku_seq VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_product_category
        FOREIGN KEY (product_category_id)
        REFERENCES product_category(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- --------------------------------------------------------------------------
-- Tabla: recipe_items
--   FK: product_id -> product(product_id)
--   FK: inventory_item_id -> inventory_items(inventory_item_id)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_items (
    recipe_item_id UUID PRIMARY KEY,

    product_id UUID NOT NULL,
    inventory_item_id UUID NOT NULL,

    quantity NUMERIC(14, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,

    line_cost NUMERIC(12, 2) NOT NULL,
    is_optional BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 🔗 FK hacia PRODUCTOS
    CONSTRAINT fk_recipe_items_product
        FOREIGN KEY (product_id)
        REFERENCES product (product_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- 🔗 FK hacia INVENTARIO
    CONSTRAINT fk_recipe_items_inventory
        FOREIGN KEY (inventory_item_id)
        REFERENCES inventory_items (inventory_item_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);