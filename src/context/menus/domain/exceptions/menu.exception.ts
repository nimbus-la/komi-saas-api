import { DomainException } from "@/shared";

export class MenuTitleTooShortException extends DomainException {
    constructor(minLength: number) {
        super({
            code: "1600",
            detail: `El título del menú debe tener mínimo ${minLength} caracteres.`,
        });
    }
}

export class MenuTitleTooLongException extends DomainException {
    constructor(maxLength: number) {
        super({
            code: "1601",
            detail: `El título del menú debe tener máximo ${maxLength} caracteres.`,
        });
    }
}

export class InvalidMenuCodeException extends DomainException {
    constructor(value: string) {
        super({
            code: "1604",
            detail: `El código de menú "${value}" no tiene un formato válido.`,
        });
    }
}

export class InvalidMenuTypeException extends DomainException {
    constructor(value: string) {
        super({
            code: "1602",
            detail: `El tipo de menú "${value}" no es válido.`,
        });
    }
}

export class InvalidMenuHierarchyException extends DomainException {
    constructor(detail: string) {
        super({
            code: "1603",
            detail,
        });
    }
}
