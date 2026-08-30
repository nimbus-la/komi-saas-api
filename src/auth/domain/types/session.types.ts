/** Por qué dejo de servir una sesión. Null mientras siga viva. */
export enum SessionRevocationReason {
    /** El usuario cerró sesión */
    Logout = 'LOGOUT',

    /** Se canjeó por una nueva en un refresh */
    Rotated = 'ROTATED',

    /** Se presentó un refres ya consumido. */
    ReuseDetected = 'REUSE_DETECTED',

    /** Un tercero la cerró */
    Revoked = 'REVOKED',
}


export interface SessionCreated {
    userId: string;
    tenantId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
}


export interface SessionPrimitives {
    id: string;
    userId: string;
    tenantId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    createdAt: Date;
    revokedAt: Date | null;
    revocationReason: SessionRevocationReason | null;
    replacedBySessionId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
}