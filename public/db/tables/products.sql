-- ============================================
-- PRODUCTOS, RECETAS Y CONFIGURACIÓN POR SUCURSAL
-- ============================================
-- Se incluye desde 01-init.sql con \ir, después de tenants, sucursales,
-- inventario y categorías, que tienen las tablas a las que apuntan estas
-- llaves foráneas. Está en una subcarpeta para que Postgres no la ejecute por
-- su cuenta al iniciar.

-- ============================================
-- SECUENCIA PARA SKU DE PRODUCTOS
-- ============================================
CREATE SEQUENCE IF NOT EXISTS product_sku_seq
    START WITH 1
    INCREMENT BY 1;


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
    -- El precio tiene que dejar profit_margin sobre este costo; lo valida la API.
    product_cost NUMERIC(12,2) NOT NULL,
    profit_margin NUMERIC(5,2) NOT NULL,
    product_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (product_status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'DELETED')),
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


-- ============================================
-- TABLA DE CONFIGURACIÓN DE PRODUCTO POR SUCURSAL
-- ============================================
-- Precio y estado de un producto en una sucursal. NULL = hereda el del producto.
-- Borrar el producto borra sus configuraciones. La sucursal no se borra de
-- verdad (branch_is_deleted), por eso queda en RESTRICT.
CREATE TABLE IF NOT EXISTS product_branch_configs (
    product_branch_config_id UUID PRIMARY KEY,

    tenant_id UUID NOT NULL
        REFERENCES tenants(tenant_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    product_id UUID NOT NULL
        REFERENCES product(product_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    branch_id UUID NOT NULL
        REFERENCES branches(branch_id)
        ON DELETE RESTRICT,

    price_amount   NUMERIC(12,2) NULL,
    price_currency VARCHAR(3)    NULL,
    is_available   BOOLEAN       NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- También sirve de índice para buscar las configuraciones de un producto.
    CONSTRAINT uq_product_branch_configs_product_branch
        UNIQUE (product_id, branch_id),

    -- El precio va completo (monto y moneda) o no va, y nunca en 0.
    CONSTRAINT ck_product_branch_configs_price
        CHECK (
            (price_amount IS NULL) = (price_currency IS NULL)
            AND (price_amount IS NULL OR price_amount > 0)
        )
);
