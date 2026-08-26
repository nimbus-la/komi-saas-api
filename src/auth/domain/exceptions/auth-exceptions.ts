import { DomainException } from "@/shared/domain/domain.exception";

export class InvalidCredentialsException extends DomainException {
    constructor(tenantSlug: string, username: string) {
        super({
            code: "1100",
            detail: `Intento de inicio de sesión fallido para '${username}' en el negocio '${tenantSlug}'`
        });
    }
}



export class InactiveAccountException extends DomainException {
    constructor(username: string) {
        super({
            code: "1101",
            detail: `El usuario '${username}' esta inactivo y no puede iniciar sesión`
        });
    }
}



export class InactiveTenantException extends DomainException {
    constructor(tenantSlug: string) {
        super({
            code: "1102",
            detail: `El negocio '${tenantSlug}' esta inactivo; se bloquea el inicio de sesión`
        });
    }
}



export class AuthTenantNotFoundException extends DomainException {
    constructor(tenantSlug: string) {
        super({
            code: "1103",
            detail: `No existe un negocio con el slug '${tenantSlug}'`
        });
    }
}