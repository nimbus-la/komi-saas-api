import { DomainException } from "@/shared";

export class InvalidCredentialsException extends DomainException {
    constructor() {
        super({
            code: "1500",
            detail: "Las credenciales proporcionadas no son válidas."
        });
    }
}