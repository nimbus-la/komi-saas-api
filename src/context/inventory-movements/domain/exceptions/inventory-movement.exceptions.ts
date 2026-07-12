import { DomainException } from "@/shared";
import { MovementType } from "../common/catalog.common";


/** Movimiento con cantidad cero o negativa. Código 1500. */
export class NonPositiveMovementQuantityException extends DomainException {
    constructor() {
        super({
            code: '1500',
            detail: 'La cantidad del movimiento debe ser mayor a cero.'
        });
    };
};



/** Merma o ajuste sin motivo. Código 1501. */
export class MovementReasonRequiredException extends DomainException {
    constructor(type: string) {
        super({
            code: '1501',
            detail: `Un movimiento de tipo ${type} requiere un motivo.`
        });
    };
};



/** Tipo de movimiento fuera del catálogo permitido (MeasurementUnit). Código 1502. */
export class InvalidInventoryMovementException extends DomainException {
    constructor(value: string) {
        const allowed = Object.values(MovementType).join(', ');

        super({
            code: '1502',
            detail: `El tipo de movimiento "${value}" no es soportado. Permitidos: ${allowed}.`
        });
    };
};