-- ============================================
-- ROLES FIJOS DEL SISTEMA
-- La tabla se crea en 01-init.sql
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
    'Dueño',
    'ADMINISTRATIVE'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'ADMIN',
    'Administrador',
    'ADMINISTRATIVE'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'SUPERVISOR',
    'Supervisor',
    'ADMINISTRATIVE'
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'CASHIER',
    'Cajero',
    'OPERATIONAL'
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    'WAITER',
    'Mesero',
    'OPERATIONAL'
),
(
    '550e8400-e29b-41d4-a716-446655440007',
    'KITCHEN',
    'Cocina',
    'OPERATIONAL'
)
ON CONFLICT (rol_id) DO NOTHING;
