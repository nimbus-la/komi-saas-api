import { Request } from "express";

export interface AuthenticatedUser {
    userId: string;
    tenantId: string;
    branchId: string | null;
    rolScope: string;
    sessionId: string;
}



export interface RequestWithUser extends Request {
    user?: AuthenticatedUser;
}



export interface AccessTokenPayload {
    sub?: unknown;
    tenantId: unknown;
    branchId?: unknown;
    rolScope: unknown;
    jti: unknown;
}