import { DomainException } from "@/shared";


/**
 * Lote (batch). Códigos 1310-1319.
 * Estándar de errores del inventario: 1300-1399 (ver README de exceptions/).
 */



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



/** Fecha de vencimiento no parseable o inválida al crear un lote. Código 1312. */
export class InvalidExpirationDateException extends DomainException {
    constructor(detail: string) {
        super({
            code: '1312',
            detail: `Fecha de vencimiento inválida: ${detail}.`
        });
    };
};



/** Item perecedero que recibe un lote sin fecha de vencimiento. Código 1313. */
export class PerishableRequiresExpirationException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1313',
            detail: `El item ${itemId} es perecedero y requiere fecha de vencimiento en el lote.`
        });
    };
};



/** El lote indicado no pertenece al item (o está agotado y no se cargó). Código 1314. */
export class BatchNotFoundException extends DomainException {
    constructor(batchId: string, itemId: string) {
        super({
            code: '1314',
            detail: `El lote ${batchId} no pertenece al item ${itemId} o ya está agotado.`
        });
    };
};
