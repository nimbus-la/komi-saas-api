import { DomainException } from "@/shared";


/**
 * Configuración de sucursal (mínimos). Códigos 1340-1349.
 * Estándar de errores del inventario: 1300-1399 (ver README de exceptions/).
 */



/**
 * La petición de mínimo de stock no indica qué configurar: no trae branches, ni
 * branchId, ni minStock. Código 1340.
 */
export class InvalidMinimumStockModeException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1340',
            detail: `La configuracion de minimo del item ${itemId} debe indicar minStock (global), branchId o branches.`
        });
    };
};



/** Se intenta fijar un mínimo por sucursal sin enviar la cantidad. Código 1341. */
export class MinimumStockValueRequiredException extends DomainException {
    constructor(branchId: string) {
        super({
            code: '1341',
            detail: `Debe indicar la cantidad mínima para la sucursal ${branchId}.`
        });
    };
};
