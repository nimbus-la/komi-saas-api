import { DomainException } from "@/shared";
import { MovementType } from "../common/catalog.common";


/** Movimiento con cantidad cero o negativa. Código 1325 (estándar de inventario 1300-1399). */
export class NonPositiveMovementQuantityException extends DomainException {
    constructor() {
        super({
            code: '1325',
            detail: 'La cantidad del movimiento debe ser mayor a cero.'
        });
    };
};



/** Merma o ajuste sin motivo. Código 1326. */
export class MovementReasonRequiredException extends DomainException {
    constructor(type: string) {
        super({
            code: '1326',
            detail: `Un movimiento de tipo ${type} requiere un motivo.`
        });
    };
};



/** Tipo de movimiento fuera del catálogo permitido (MeasurementUnit). Código 1327. */
export class InvalidInventoryMovementException extends DomainException {
    constructor(value: string) {
        const allowed = Object.values(MovementType).join(', ');

        super({
            code: '1327',
            detail: `El tipo de movimiento "${value}" no es soportado. Permitidos: ${allowed}.`
        });
    };
};
