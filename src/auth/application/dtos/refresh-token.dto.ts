export interface GeneratedRefreshToken {
    plain: string;
    hash: string;
}


export interface SessionContext {
    ipAddress: string | null;
    userAgent: string | null;
}


export interface AuthTokens {
    accessToken: string;
    accessExpiresAt: Date;
    refreshToken: string;
    refreshExpiresAt: Date;
}


/**
 * Los mismos tokens, ya con los nombres y el formato con los que salen por la
 * API. Login y refresh devuelven exactamente esto, ni uno más ni uno menos.
 */
export interface AuthTokensResponse {
    sessionToken: string;
    expiredAt: string;
    refreshToken: string;
    refreshExpiresAt: string;
}