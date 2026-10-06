import { AuthTokens, SessionExpiration } from "../dtos";


export const toSessionExpiration = (tokens: AuthTokens): SessionExpiration => ({
    accessExpiresAt: tokens.accessExpiresAt.toISOString(),
    refreshExpiresAt: tokens.refreshExpiresAt.toISOString(),
});
