CREATE SEQUENCE IF NOT EXISTS inventory_item_sku_seq START 1;

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