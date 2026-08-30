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