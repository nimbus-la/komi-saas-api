import { DomainException } from "@/shared/domain/domain.exception";

/**
 * Errores de las sesiones, familia 11xx igual que el resto de auth.
 *
 * Todos se traducen a 401 hacia el cliente: en cualquiera de estos casos la
 * respuesta correcta del front es la misma —volver al login—, y distinguirlos
 * hacia afuera solo le diría a un atacante qué tan cerca estuvo.
 */

/** El refresh no existe, ya se usó o fue revocado. */
export class InvalidRefreshTokenException extends DomainException {
    constructor() {
        super({
            code: "1104",
            detail: `El token de renovación no es válido, ya fue usado o fue revocado`
        });
    }
}


export class ExpiredRefreshTokenException extends DomainException {
    constructor() {
        super({
            code: "1105",
            detail: `El token de renovación expiró; se requiere iniciar sesión de nuevo`
        });
    }
}


/**
 * Se presentó un refresh YA CONSUMIDO. Solo puede pasar si existen dos copias
 * del mismo token, así que se trata como robo: se cierran todas las sesiones
 * del usuario. Debe estar conectada a alertas.
 */
export class RefreshTokenReuseDetectedException extends DomainException {
    constructor(userId: string) {
        super({
            code: "1106",
            detail: `Reúso de token de renovación detectado para el usuario '${userId}'; se revocaron todas sus sesiones`
        });
    }
}