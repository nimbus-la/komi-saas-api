import { AuthTokens, AuthTokensResponse } from "../dtos";

/**
 * Pone los tokens en la forma con la que salen por la API.
 *
 * Existe porque login y refresh devuelven los mismos cuatro campos y cada uno los
 * armaba por su cuenta: uno terminó mandando `refreshExpiresAt` y el otro
 * `refreshExpiredAt`, así que el cliente necesitaba dos ramas para leer lo mismo.
 * Con un solo sitio donde se decide el nombre, no pueden volver a separarse.
 *
 * Las fechas se serializan aquí, en ISO 8601 y en UTC, para que el cliente reciba
 * texto y no dependa de cómo se le ocurra a JSON.stringify convertir un Date.
 */
export const toAuthTokensResponse = (tokens: AuthTokens): AuthTokensResponse => ({
    sessionToken: tokens.accessToken,
    expiredAt: tokens.accessExpiresAt.toISOString(),
    refreshToken: tokens.refreshToken,
    refreshExpiresAt: tokens.refreshExpiresAt.toISOString(),
});
