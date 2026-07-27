import { DomainException } from "@/shared";

export class InvalidUserNameException extends DomainException {
    constructor(reason: string) {
        super({
            code: "1016",
            detail: `El nombre de usuario es inválido ${reason}.`,
        });
    }
}

export class InvalidUserEmailException extends DomainException {
    constructor(reason: string) {
        super({
            code: "1019",
            detail: `El correo electrónico es inválido ${reason}.`,
        });
    }
}

export class InvalidUserPasswordException extends DomainException {
    constructor(reason: string) {
        super({
            code: "1020",
            detail: `La contraseña es inválida ${reason}.`,
        });
    }
}

export class InvalidUserFullNameException extends DomainException {
    constructor(reason: string) {
        super({
            code: "1018",
            detail: `El nombre del usuario es inválido ${reason}.`,
        });
    }
}

export class InvalidUserLastNameException extends DomainException {
    constructor(reason: string) {
        super({
            code: "1021",
            detail: `El apellido del usuario es inválido ${reason}.`,
        });
    }
}

export class InvalidUserBirthDateException extends DomainException {
    constructor(reason: string) {
        super({
            code: "1022",
            detail: `La fecha de nacimiento es inválida ${reason}.`,
        });
    }
}

export class InvalidUserSexException extends DomainException {
    constructor(reason: string) {
        super({
            code: "1023",
            detail: `El sexo del usuario es inválido ${reason}.`,
        });
    }
}

export class InvalidUserPhoneException extends DomainException {
    constructor(reason: string) {
        super({
            code: "1024",
            detail: `El teléfono del usuario es inválido ${reason}.`,
        });
    }
}

export class UserAlreadyActiveException extends DomainException {
    constructor() {
        super({
            code: "1213",
            detail: "El usuario ya se encuentra activo.",
        });
    }
}

export class UserAlreadyInactiveException extends DomainException {
    constructor() {
        super({
            code: "1214",
            detail: "El usuario ya se encuentra inactivo.",
        });
    }
}

export class UserNotFoundException extends DomainException {
    constructor(id: string) {
        super({
            code: "1215",
            detail: `No existe un usuario con id '${id}'.`,
        });
    }
}

export class UserNameAlreadyExistsException extends DomainException {
    constructor(userName: string) {
        super({
            code: "1211",
            detail: `El nombre de usuario '${userName}' ya se encuentra registrado.`,
        });
    }
}

export class UserEmailAlreadyExistsException extends DomainException {
    constructor(email: string) {
        super({
            code: "1212",
            detail: `El correo electrónico '${email}' ya se encuentra registrado.`,
        });
    }
}