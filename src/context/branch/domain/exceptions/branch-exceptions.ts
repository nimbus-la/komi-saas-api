import { DomainException } from "@/shared";

/**
 * Se lanza cuando la sucursal no existe. Código 1207.
 *
 * Antes usaba el 1330, que en el catálogo es "Debe especificar una sucursal para
 * esta operación" y sale como 409: ni describía el problema ni daba el estado
 * correcto. También cubre el caso de la sucursal que existe pero es de otro
 * negocio, y ahí decir "no existe" es justo lo que hay que decir.
 */
export class BranchNotFoundException extends DomainException {
    constructor(branchId: string) {
        super({
            code: '1207',
            detail: `La sucursal ${branchId} no existe o no está disponible.`
        });
    };
};

/** Se lanza cuando el nombre de la sucursal ya está registrado. Código 1206. */
export class BranchNameAlreadyExistsException extends DomainException {
    constructor(name: string) {
        super({
            code: '1206',
            detail: `El nombre "${name}" ya está registrado.`
        });
    };
};

/** Se intenta desactivar una sucursal que ya está inactiva. Código 1216. */
export class BranchAlreadyInactiveException extends DomainException {
    constructor(branchId: string) {
        super({
            code: '1216',
            detail: `La sucursal ${branchId} ya se encuentra desactivada.`
        });
    };
};

/** Se intenta activar una sucursal que ya está activa. Código 1217. */
export class BranchAlreadyActiveException extends DomainException {
    constructor(branchId: string) {
        super({
            code: '1217',
            detail: `La sucursal ${branchId} ya se encuentra activa.`
        });
    };
};

/** Se intenta actualizar una sucursal sin enviar ningún cambio. Código 1031. */
export class BranchEmptyUpdateException extends DomainException {
    constructor(branchId: string) {
        super({
            code: '1031',
            detail: `No se enviaron cambios para actualizar la sucursal ${branchId}.`
        });
    };
};

/** Se intenta actualizar un campo con el mismo valor que ya tiene. Código 1032. */
export class BranchFieldUnchangedException extends DomainException {
    constructor(field: string) {
        super({
            code: '1032',
            detail: `El campo ${field} es igual al valor actual de la sucursal.`
        });
    };
};

/** Se lanza cuando el nombre de la sucursal es inválido. Código 1009. */
export class InvalidBranchNameException extends DomainException {
    constructor(reason: string){
        super({
            code: '1009',
            detail: `Nombre del branch es inválido: ${reason}.`
        });
    };
};

/** Se lanza cuando la dirección de la sucursal es inválida. Código 1010. */
export class InvalidBranchAddressException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1010',
            detail: `Dirección de la sucursal inválida: ${reason}.`
        });
    };
};

/** Se lanza cuando la ciudad de la sucursal es inválida. Código 1012. */
export class InvalidBranchCityException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1012',
            detail: `Ciudad de la sucursal inválida: ${reason}.`
        });
    }
}

/** Se lanza cuando el departamento de la sucursal es inválido. Código 1013. */
export class InvalidBranchDepartmentException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1013',
            detail: `Departamento de la sucursal inválido: ${reason}.`
        });
    };
};

/** Se lanza cuando el teléfono de la sucursal es inválido. Código 1011. */
export class InvalidBranchPhoneException extends DomainException {
    constructor(reason: string){
        super({
            code: '1011',
            detail: `Teléfono de la sucursal inválido: ${reason}.`
        });
    };
};