import { DomainException } from "@/shared";

export class TenantIdRequiredForSearchException extends DomainException {
    constructor() {
        super({
            code: "1409",
            detail: "El tenantId es obligatorio para buscar productos.",
        });
    }
}


export class TenantNotFoundException extends DomainException {
    constructor(tenantId: string) {
        super({
            code: "1205",
            detail: `No se encontró el tenant con id ${tenantId}.`,
        });
    }
}