import { DomainException } from "@/shared";


/**
 * Movimientos de stock: consumo, merma, conteo. Códigos 1320-1329.
 * Estándar de errores del inventario: 1300-1399 (ver README de exceptions/).
 */



/** Se intenta consumir/mermar/contar una cantidad cero o negativa. Código 1320. */
export class NonPositiveConsumptionException extends DomainException {
    constructor() {
        super({
            code: '1320',
            detail: 'La cantidad a consumir debe ser mayor a cero.'
        });
    };
};



/** Se pide consumir/mermar más de lo disponible (suma de lotes activos). Código 1321. */
export class InsufficientStockException extends DomainException {
    constructor(itemId: string, requested: string, available: string) {
        super({
            code: '1321',
            detail: `Stock insuficiente para el item ${itemId}: se solicitaron ${requested} y hay ${available} disponibles.`
        });
    };
};



/** Merma, ajuste o conteo sin motivo. Código 1322. */
export class ReasonRequiredException extends DomainException {
    constructor(operation: string) {
        super({
            code: '1322',
            detail: `La operación de ${operation} requiere un motivo.`
        });
    };
};



/** Ajuste/conteo cuya cantidad real coincide con la registrada. Código 1323. */
export class NoAdjustmentDifferenceException extends DomainException {
    constructor(reference: string) {
        super({
            code: '1323',
            detail: `No hay diferencia que ajustar en ${reference}: la cantidad real coincide con la registrada.`
        });
    };
};



/** El conteo físico da MÁS de lo que hay en sistema: el sobrante debe registrarse
 *  como una entrada (con su costo y vencimiento), no como un ajuste. Código 1324. */
export class CountIncreaseNotAllowedException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1324',
            detail: `El conteo del item ${itemId} supera el stock registrado. El sobrante debe registrarse como una entrada de mercancía, no como un conteo.`
        });
    };
};
