import { ResponseLoginDto } from "./response-login.dto";

export interface GeneratedRefreshToken {
    plain: string;
    hash: string;
}


export interface SessionContext {
    ipAddress: string | null;
    userAgent: string | null;
}


export interface SessionExpiration {
    accessExpiresAt: string;
    refreshExpiresAt: string;
}



export interface AuthTokens {
    accessToken: string;
    accessExpiresAt: Date;
    refreshToken: string;
    refreshExpiresAt: Date;
}



/** Lo que devuelve el caso de uso de login: los tokens en crudo, más el usuario. */
export interface LoginResult {
    tokens: AuthTokens;
    lastLogin: string;
    user: ResponseLoginDto;
}



export type LoginResponse = SessionExpiration & Omit<LoginResult, 'tokens'>;