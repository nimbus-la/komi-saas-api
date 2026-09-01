CREATE TABLE IF NOT EXISTS sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    refresh_token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revocation_reason VARCHAR(20),
    replaced_by_session_id UUID,
    ip_address INET,
    user_agent VARCHAR(512),

    CONSTRAINT chk_sessions_revocation CHECK (
        (revoked_at IS NULL AND revocation_reason IS NULL) OR
        (revoked_at IS NOT NULL AND revocation_reason IS NOT NULL)
    )
);


-- ============================================
-- Índices y claves foráneas
--
-- Van sueltos y no dentro del CREATE TABLE a propósito: el script de arriba lleva
-- IF NOT EXISTS, así que en una base que ya tenga la tabla se saltaría entero y
-- nunca llegarían. Escritos así, este archivo se puede volver a correr sobre una
-- base existente y solo añade lo que falte.
-- ============================================

-- La usa revokeAllByUser, que se dispara al detectar un reúso de token y al dar
-- de baja a un usuario o a un negocio. Sin ella es un recorrido completo de la
-- tabla, que crece una fila por cada login Y por cada renovación.
CREATE INDEX IF NOT EXISTS idx_sessions_user_active
    ON sessions (user_id)
    WHERE revoked_at IS NULL;

-- Para encontrar rápido lo que ya no sirve a la hora de limpiar.
CREATE INDEX IF NOT EXISTS idx_sessions_expires
    ON sessions (expires_at)
    WHERE revoked_at IS NULL;

-- Postgres no indexa solo las columnas que apuntan a otra tabla, y esta hace
-- falta para que el ON DELETE SET NULL de abajo no tenga que recorrerlo todo.
CREATE INDEX IF NOT EXISTS idx_sessions_replaced_by
    ON sessions (replaced_by_session_id)
    WHERE replaced_by_session_id IS NOT NULL;


DO $$
BEGIN
    -- Las sesiones son subordinadas del usuario: si el usuario se va, se van con
    -- él. Es el único CASCADE del esquema, y aquí tiene sentido porque una sesión
    -- sin dueño no significa nada.
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sessions_user') THEN
        ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user
            FOREIGN KEY (user_id) REFERENCES users (user_id)
            ON UPDATE CASCADE ON DELETE CASCADE;
    END IF;

    -- RESTRICT, igual que el resto del esquema: un negocio con sesiones abiertas
    -- no se borra por accidente.
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sessions_tenant') THEN
        ALTER TABLE sessions ADD CONSTRAINT fk_sessions_tenant
            FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
            ON UPDATE CASCADE ON DELETE RESTRICT;
    END IF;

    /*
     * La cadena de rotación apuntando a sesiones reales.
     *
     * DEFERRABLE INITIALLY DEFERRED es obligatorio: al renovar se marca primero la
     * sesión anterior (dejando ya escrito el id de su sucesora) y solo después se
     * inserta esa sucesora. Ese orden es deliberado —así quien pierde la carrera
     * ni siquiera llega a insertar—, y con una FK inmediata el UPDATE fallaría por
     * apuntar a una fila que todavía no existe. Diferida, se comprueba al cerrar
     * la transacción, cuando las dos filas ya están.
     *
     * ON DELETE SET NULL para que la limpieza de sesiones viejas no se tropiece
     * con la cadena: si se borra una sucesora, su predecesora se queda sin puntero
     * en vez de bloquear el borrado.
     */
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sessions_replaced_by') THEN
        ALTER TABLE sessions ADD CONSTRAINT fk_sessions_replaced_by
            FOREIGN KEY (replaced_by_session_id) REFERENCES sessions (session_id)
            ON DELETE SET NULL
            DEFERRABLE INITIALLY DEFERRED;
    END IF;
END
$$;
