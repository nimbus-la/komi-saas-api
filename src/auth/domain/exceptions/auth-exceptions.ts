import { DomainException } from "@/shared/domain/domain.exception";

/**
 * Errores del inicio de sesión. Todos usan códigos de la familia 11xx.
 *
 * El detalle que llevan es para los logs y para quien tenga que revisar qué pasó;
 * lo que ve el cliente lo decide el filtro de excepciones, que no devuelve estos
 * textos tal cual.
 */

/**
 * El usuario no existe o la contraseña no coincide. A propósito es la misma
 * excepción para los dos casos: separarlas dejaría averiguar qué nombres de
 * usuario están registrados probando uno por uno.
 */
export class InvalidCredentialsException extends DomainException {
    constructor(tenantSlug: string, username: string) {
        super({
            code: "1100",
            detail: `Intento de inicio de sesión fallido para '${username}' en el negocio '${tenantSlug}'`
        });
    }
}



/**
 * Las credenciales estaban bien pero la cuenta está deshabilitada. Solo puede
 * salir después de verificar la contraseña, nunca antes.
 */
export class InactiveAccountException extends DomainException {
    constructor(username: string) {
        super({
            code: "1101",
            detail: `El usuario '${username}' esta inactivo y no puede iniciar sesión`
        });
    }
}



/**
 * El negocio existe pero está deshabilitado, así que ninguno de sus usuarios
 * puede entrar por más que sus credenciales sean correctas.
 */
export class InactiveTenantException extends DomainException {
    constructor(tenantSlug: string) {
        super({
            code: "1102",
            detail: `El negocio '${tenantSlug}' esta inactivo; se bloquea el inicio de sesión`
        });
    }
}



/**
 * La petición viene firmada por un negocio pero apunta a otro. El token es
 * válido, así que no es un 401: es alguien autenticado tocando donde no le
 * corresponde, y eso merece quedar registrado con los dos identificadores.
 */
export class CrossTenantAccessException extends DomainException {
    constructor(tokenTenantId: string, requestedTenantId: string) {
        super({
            code: "1107",
            detail: `Un usuario del negocio '${tokenTenantId}' intentó operar sobre el negocio '${requestedTenantId}'`
        });
    }
}
