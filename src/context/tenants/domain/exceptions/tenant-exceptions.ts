import { DomainException } from "@/shared";

/** Se lanza cuando el NIT del tenant es inválido. Código 1006. */
export class InvalidTenantNitException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1006',
            detail: `NIT de tenant inválido: ${reason}.`
        });
    };
};

/** Se lanza cuando el NIT del tenant ya está registrado. Código 1202. */
export class TenantNitAlreadyExistsException extends DomainException {
    constructor(nit: string) {
        super({
            code: '1202',
            detail: `El NIT "${nit}" ya esta registrado.`
        });
    };
};

/** Se lanza cuando el tenant no existe. Código 1205. */
export class TenantNotFoundException extends DomainException {
    constructor(tenantId: string) {
        super({
            code: '1205',
            detail: `El tenant ${tenantId} no existe.`
        });
    };
};

/** Se lanza cuando el nombre del tenant es inválido. Código 1005. */
export class InvalidTenantNameException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1005',
            detail: `Nombre de tenant inválido: ${reason}.`
        });
    };
};

/** Se lanza cuando el nombre del tenant ya está registrado. Código 1204. */
export class TenantNameAlreadyExistsException extends DomainException {
    constructor(name: string) {
        super({
            code: '1204',
            detail: `El nombre "${name}" ya esta registrado.`
        });
    };
};

/** Se lanza cuando el slug del tenant es inválido. Código 1007. */
export class InvalidTenantSlugException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1007',
            detail: `Slug de tenant inválido: ${reason}.`
        });
    };
};

/** Se lanza cuando el slug del tenant ya está registrado. Código 1203. */
export class TenantSlugAlreadyExistsException extends DomainException {
    constructor(slug: string) {
        super({
            code: '1203',
            detail: `El slug "${slug}" ya esta registrado.`
        });
    };
};

/** Se lanza cuando la descripción del tenant es inválida. Código 1008. */
export class InvalidTenantDescriptionException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1008',
            detail: `Descripción de tenant inválida: ${reason}.`
        });
    };
};