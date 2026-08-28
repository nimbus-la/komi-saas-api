export interface SessionClaims {
    userId: string;
    tenantId: string;
    branchId: string | null;
    rolScope: string;
    sessionId: string;
}



export interface IssuedToken {
    accessToken: string;
    expiresAt: Date;
}