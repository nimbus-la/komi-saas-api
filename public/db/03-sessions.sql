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
)