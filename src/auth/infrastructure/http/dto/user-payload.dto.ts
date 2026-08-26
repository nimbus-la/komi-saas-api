import { IsNotEmpty, IsString, MaxLength } from "class-validator";

/**
 * Lo que se recibe en POST /auth/login.
 *
 * Aquí solo se valida la forma del payload, nada de reglas de negocio. Los topes
 * de longitud son los mismos que los de los value objects y los de los DTOs con
 * los que se crean usuarios y negocios; si el login fuera más estricto terminaría
 * respondiendo 400 a gente que el propio sistema dejó registrarse.
 */
export class UserLoginPayloadDto {
    /** Hasta 100 caracteres, igual que TenantSlug. */
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    tenantSlug!: string;

    /** Hasta 30 caracteres, igual que UserName. */
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    username!: string;

    /**
     * Solo se le pone tope máximo. No hay longitud mínima ni reglas de complejidad
     * a propósito: una contraseña corta o pobre es un intento fallido (401), no un
     * payload inválido (400), y decirle a quien la manda que "es muy corta" ya es
     * contarle algo sobre la contraseña real.
     */
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    password!: string;
}
