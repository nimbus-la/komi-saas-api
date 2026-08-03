import { DomainException } from "@/shared";

export class InvalidRolCodeException extends DomainException{
    constructor(reason: string) {
        super({
            code: '1016',
            detail:  `El código del rol es inválido ${reason}.`
        });
    };
};

export class InvalidRolNameException extends DomainException {
    constructor(reason: string) {
        super({
            code: "1017",
            detail: `El nombre del rol es inválido: ${reason}.`,
        });
    }
};

export class RolNameAlreadyExistsException extends DomainException {
    constructor(name: string) {
        super({
            code: "1208",
            detail: `Ya existe un rol con el nombre ${name}.`,
        });
    }
}

export class RolCodeAlreadyExistsException extends DomainException {
    constructor(code: string) {
        super({
            code: "1209",
            detail: `Ya existe un rol con el código ${code}.`,
        });
    }
}

export class RolNotFoundException extends DomainException {
    constructor(id: string) {
        super({
            code: "1210",
            detail: `No existe un rol con el id ${id}.`,
        });
    }
}

export class InvalidRolScopeException extends DomainException {
    constructor(reason: string) {
        super({
            code: "1025",
            detail: `El alcance del rol es inválido ${reason}.`,
        });
    }
}