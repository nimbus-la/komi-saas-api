import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * El refresh token ya viaja en la cookie httpOnly, así que el cuerpo llega
 * vacío en el camino normal y el campo es opcional.
 *
 * `@IsOptional()` no es cosmético ni redundante con el `?` de TypeScript:
 * class-validator no lee el tipo, y sin ese decorador `@IsNotEmpty` rechaza con
 * 400 toda petición sin cuerpo, que es justamente el caso de la cookie.
 *
 * El campo se conserva mientras exista el fallback por body del decorador
 * `@RefreshToken()`, para que lo que llegue por ahí siga estando acotado.
 */
export class RefreshTokenPayloadDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    refreshToken?: string;
}
