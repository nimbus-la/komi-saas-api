import { DomainException } from "@/shared";


/**
 * Reglas de actualización del item. Códigos 1350-1359.
 * Estándar de errores del inventario: 1300-1399 (ver README de exceptions/).
 */



/** Se intenta cambiar la unidad de medida de un item que ya tiene lotes. Código 1350. */
export class UnitChangeNotAllowedException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1350',
            detail: `No se puede cambiar la unidad de medida del item ${itemId}: ya tiene lotes registrados.`
        });
    };
};



/** Se intenta cambiar la perecibilidad de un item que ya tiene lotes. Código 1351. */
export class PerishabilityChangeNotAllowedException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1351',
            detail: `No se puede cambiar la perecibilidad del item ${itemId}: ya tiene lotes registrados.`
        });
    };
};



/** Se intenta actualizar un item sin enviar ningún cambio. Código 1352. */
export class EmptyUpdateException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1352',
            detail: `No se enviaron cambios para actualizar el item ${itemId}.`
        });
    };
};
