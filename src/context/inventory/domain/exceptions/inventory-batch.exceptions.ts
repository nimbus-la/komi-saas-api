import { DomainException } from "@/shared";


/**
 * Se lanza al crear un lote con cantidad recibida cero o negativa.
 * Un lote representa una recepción de mercancía: sin cantidad no tiene sentido.
 * Código 1310.
 */
export class EmptyBatchException extends DomainException {
    constructor() {
        super({
            code: '1310',
            detail: 'La cantidad recibida del lote debe ser mayor a cero.'
        });
    };
};



/**
 * Se lanza al consumir de un lote más de lo que le queda.
 * Protege la invariante del lote: la cantidad restante nunca queda negativa.
 * La selección del lote la hace el root (FEFO); esta es su salvaguarda interna.
 * Código 1311.
 */
export class InsufficientBatchQuantityException extends DomainException {
    constructor() {
        super({
            code: '1311',
            detail: 'No hay cantidad suficiente en el lote para consumir.'
        });
    };
};