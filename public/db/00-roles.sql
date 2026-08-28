-- ============================================
-- TABLA DE ROLES
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
    rol_id UUID PRIMARY KEY,
    rol_code VARCHAR(20) NOT NULL UNIQUE,
    rol_name VARCHAR(50) NOT NULL UNIQUE,
    rol_scope VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_roles_scope
        CHECK (rol_scope IN ('ADMINISTRATIVE', 'OPERATIONAL'))
);


-- ============================================
-- ROLES FIJOS DEL SISTEMA
-- ============================================
INSERT INTO roles (
    rol_id,
    rol_code,
    rol_name,
    rol_scope
)
VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'OWNER',
    'OWNER',
    'ADMINISTRATIVE'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'ADMIN',
    'ADMIN',
    'ADMINISTRATIVE'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'SUPERVISOR',
    'SUPERVISOR',
    'ADMINISTRATIVE'
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'CASHIER',
    'CASHIER',
    'OPERATIONAL'
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    'WAITER',
    'WAITER',
    'OPERATIONAL'
),
(
    '550e8400-e29b-41d4-a716-446655440007',
    'KITCHEN',
    'KITCHEN',
    'OPERATIONAL'
)

ON CONFLICT (rol_id) DO NOTHING;


-- ============================================
-- CLAVE COMPUESTA PARA VALIDAR ROL + ALCANCE
-- ============================================

ALTER TABLE roles
ADD CONSTRAINT uq_roles_id_scope
UNIQUE (rol_id, rol_scope);
