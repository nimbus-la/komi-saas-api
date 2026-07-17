import { DomainException } from "@/shared";

/** Se lanza cuando la sucursal no existe. Código 1330. */
export class BranchNotFoundException extends DomainException {
    constructor(branchId: string) {
        super({
            code: '1330',
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