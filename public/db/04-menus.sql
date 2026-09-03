-- ============================================
-- MENÚ DEL SIDEBAR
--
-- Catálogo de plataforma: el árbol es el mismo para todos los negocios, así que
-- la tabla no lleva tenant_id. Lo que cambia de un usuario a otro es qué ramas
-- ve, y eso se resolverá por rol más adelante (tabla puente menu_roles).
--
-- Los tres niveles —primario, secundario, terciario— viven en la misma tabla
-- apuntándose con parent_id. Separarlos en tres tablas sería el mismo árbol
-- escrito tres veces: tres entidades, tres mappers y tres consultas para armar
-- lo que aquí sale de una.
-- ============================================

CREATE TABLE IF NOT EXISTS menu (
    menu_id UUID PRIMARY KEY,

    -- NULL sólo en los primarios: son las raíces del árbol.
    parent_id UUID,

    -- Identificador estable con el que el front señala a un menú concreto
    -- ('INVENTORY_ITEMS', 'ADMIN_USERS_ROLES') para tratarlo distinto: sacarlo
    -- del sidebar y ponerlo en el navbar, esconderlo, pintarlo aparte.
    --
    -- Se escribe a mano y no se deriva del título ni de la url. Si saliera de
    -- ahí, renombrar un menú o cambiarle la ruta le cambiaría el código, y lo
    -- que el front tuviera anclado se rompería sin que nadie lo note.
    --
    -- Nace aceptando NULL y se cierra al final del archivo, ya sembrado el
    -- árbol. Es lo que permite correr este script sobre una base que tenía la
    -- tabla de antes de que el código existiera: la columna se agrega, el
    -- INSERT la rellena y recién ahí pasa a ser obligatoria.
    menu_code VARCHAR(60),

    menu_type VARCHAR(12) NOT NULL,
    menu_title VARCHAR(120) NOT NULL,
    menu_subtitle VARCHAR(225),

    -- Nombre del icono que el front resuelve contra su propia librería. La API
    -- no sabe nada de cómo se dibuja.
    menu_icon VARCHAR(80),

    -- NULL en los que sólo agrupan: un menú con hijos no navega a ningún lado.
    menu_url VARCHAR(225),

    menu_order INT NOT NULL DEFAULT 0,
    menu_is_active BOOLEAN NOT NULL DEFAULT TRUE,
    menu_is_new BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- Índices y restricciones
--
-- Van sueltos y no dentro del CREATE TABLE por lo mismo que en 03-sessions.sql:
-- con IF NOT EXISTS, una base que ya tenga la tabla se saltaría el bloque entero
-- y nunca llegarían. Así este archivo se puede volver a correr y sólo añade lo
-- que falte.
-- ============================================

-- Para las bases que ya tenían la tabla de antes de que existiera el código.
ALTER TABLE menu
    ADD COLUMN IF NOT EXISTS menu_code VARCHAR(60);

-- Borrar un menú se lleva su rama entera; un hijo sin padre no es nada.
ALTER TABLE menu
    DROP CONSTRAINT IF EXISTS fk_menu_parent;

ALTER TABLE menu
    ADD CONSTRAINT fk_menu_parent
        FOREIGN KEY (parent_id)
        REFERENCES menu (menu_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE menu
    DROP CONSTRAINT IF EXISTS ck_menu_type;

ALTER TABLE menu
    ADD CONSTRAINT ck_menu_type
        CHECK (menu_type IN ('PRIMARY', 'SECONDARY', 'TERTIARY'));

-- La única coherencia jerárquica que se puede expresar sin mirar otra fila: un
-- primario es raíz y nada más que un primario lo es. Que el padre de un
-- secundario sea primario (y el de un terciario, secundario) lo valida el
-- dominio al hidratar.
ALTER TABLE menu
    DROP CONSTRAINT IF EXISTS ck_menu_root_is_primary;

ALTER TABLE menu
    ADD CONSTRAINT ck_menu_root_is_primary
        CHECK (
            (menu_type = 'PRIMARY' AND parent_id IS NULL) OR
            (menu_type <> 'PRIMARY' AND parent_id IS NOT NULL)
        );

-- El mismo formato que valida el objeto de valor MenuCode, repetido aquí porque
-- el seed entra por SQL sin pasar por la aplicación.
ALTER TABLE menu
    DROP CONSTRAINT IF EXISTS ck_menu_code_format;

ALTER TABLE menu
    ADD CONSTRAINT ck_menu_code_format
        CHECK (menu_code ~ '^[A-Z][A-Z0-9_]*$');

-- El orden de la consulta que arma el árbol: hermanos juntos y ya ordenados.
CREATE INDEX IF NOT EXISTS idx_menu_parent_order
    ON menu (parent_id, menu_order);


-- ============================================
-- MENÚS INICIALES
--
-- Ids fijos para que volver a correr el archivo no duplique nada y para que las
-- referencias de parent_id se puedan escribir a mano, igual que en 02-roles.sql.
-- ============================================

INSERT INTO menu (
    menu_id,
    parent_id,
    menu_code,
    menu_type,
    menu_title,
    menu_subtitle,
    menu_icon,
    menu_url,
    menu_order,
    menu_is_new
)
VALUES
-- Primarios
('660e8400-e29b-41d4-a716-446655441101', NULL, 'DASHBOARD', 'PRIMARY', 'Dashboard', 'Resumen del negocio', 'layout-dashboard', '/dashboard', 1, FALSE),
('660e8400-e29b-41d4-a716-446655441102', NULL, 'INVENTORY', 'PRIMARY', 'Inventario', 'Insumos y existencias', 'package', NULL, 2, FALSE),
('660e8400-e29b-41d4-a716-446655441105', NULL, 'PRODUCTS', 'PRIMARY', 'Productos', 'Carta y recetas', 'utensils', NULL, 3, FALSE),
('660e8400-e29b-41d4-a716-446655441109', NULL, 'ADMIN', 'PRIMARY', 'Administración', 'Configuración del negocio', 'settings', NULL, 4, FALSE),

-- Secundarios de Inventario
('660e8400-e29b-41d4-a716-446655441103', '660e8400-e29b-41d4-a716-446655441102', 'INVENTORY_ITEMS', 'SECONDARY', 'Items', 'Catálogo de insumos', NULL, '/inventory/items', 1, FALSE),
('660e8400-e29b-41d4-a716-446655441104', '660e8400-e29b-41d4-a716-446655441102', 'INVENTORY_MOVEMENTS', 'SECONDARY', 'Movimientos', 'Entradas, salidas y ajustes', NULL, '/inventory/movements', 2, FALSE),

-- Secundarios de Productos
('660e8400-e29b-41d4-a716-446655441106', '660e8400-e29b-41d4-a716-446655441105', 'PRODUCTS_LIST', 'SECONDARY', 'Productos', 'Lo que se vende', NULL, '/products', 1, FALSE),
('660e8400-e29b-41d4-a716-446655441107', '660e8400-e29b-41d4-a716-446655441105', 'PRODUCTS_CATEGORIES', 'SECONDARY', 'Categorías', 'Agrupación de la carta', NULL, '/products/categories', 2, FALSE),
('660e8400-e29b-41d4-a716-446655441108', '660e8400-e29b-41d4-a716-446655441105', 'PRODUCTS_RECIPES', 'SECONDARY', 'Recetas', 'Insumos por producto', NULL, '/products/recipes', 3, TRUE),

-- Secundarios de Administración
('660e8400-e29b-41d4-a716-446655441110', '660e8400-e29b-41d4-a716-446655441109', 'ADMIN_USERS', 'SECONDARY', 'Usuarios', 'Personas con acceso', NULL, '/admin/users', 1, FALSE),
('660e8400-e29b-41d4-a716-446655441112', '660e8400-e29b-41d4-a716-446655441109', 'ADMIN_BRANCHES', 'SECONDARY', 'Sucursales', 'Puntos de venta', NULL, '/admin/branches', 2, FALSE),

-- Terciario de Usuarios
('660e8400-e29b-41d4-a716-446655441111', '660e8400-e29b-41d4-a716-446655441110', 'ADMIN_USERS_ROLES', 'TERTIARY', 'Roles', 'Permisos por rol', NULL, '/admin/users/roles', 1, FALSE)

-- Rellena el código de las filas que ya existían sin él, y no toca nada más: un
-- menú que alguien renombró o reordenó a mano se queda como está.
ON CONFLICT (menu_id) DO UPDATE
    SET menu_code = EXCLUDED.menu_code
    WHERE menu.menu_code IS NULL;


-- ============================================
-- Cierre de la columna de código
--
-- Va al final a propósito: sembrado el árbol ya no queda ningún menú sin código,
-- así que la columna puede volverse obligatoria y única.
-- ============================================

ALTER TABLE menu
    ALTER COLUMN menu_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_menu_code
    ON menu (menu_code);
