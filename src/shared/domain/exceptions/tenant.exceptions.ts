import { DomainException } from "../domain.exception";


/** El tenant del usuario no existe. Lo usa cualquier módulo que valide el negocio. */
export class TenantNotFoundException extends DomainException {
    constructor(tenantId: string) {
        super({
            code: "1205",
            detail: `El negocio ${tenantId} no existe.`
        });
    }
}