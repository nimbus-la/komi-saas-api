import { DomainException } from "../domain.exception";
import { EntityStatus } from "./entity-status";


/** Llegó un estado que no es ninguno de los de EntityStatus. */
export class InvalidStatusException extends DomainException {
    constructor(value: string) {
        super({
            code: "1035",
            detail: `El estado ${value} no es válido.`,
        });
    }
}


/** Se pidió pasar al mismo estado en el que ya está. */
export class StatusAlreadySetException extends DomainException {
    constructor(status: EntityStatus) {
        super({
            code: "1036",
            detail: `El registro ya se encuentra en estado ${status}.`,
        });
    }
}


/** La transición no está en la tabla de Status (por ejemplo, salir de DELETED). */
export class StatusTransitionNotAllowedException extends DomainException {
    constructor(from: EntityStatus, to: EntityStatus) {
        super({
            code: "1037",
            detail: `No se puede pasar de ${from} a ${to}.`,
        });
    }
}