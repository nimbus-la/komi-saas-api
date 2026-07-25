import { DomainException } from "@/shared";


/**
 * Sucursal (scope dentro de inventario). Códigos 1330-1339.
 * Estándar de errores del inventario: 1300-1399 (ver README de exceptions/).
 */



/** Se intenta consumir sobre un agregado cargado con lotes de varias sucursales. Código 1330. */
export class AmbiguousBranchScopeException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1330',
            detail: `No se puede consumir el item ${itemId} sin especificar una sucursal: hay lotes de varias sedes cargados.`
        });
    };
};



/** El arreglo de configuración trae la misma sucursal dos veces. Código 1331. */
export class DuplicateBranchInBatchException extends DomainException {
    constructor(branchId: string) {
        super({
            code: '1331',
            detail: `La sucursal ${branchId} aparece más de una vez en la configuración.`
        });
    };
};



/**
 * La sucursal indicada no existe o no pertenece al tenant. Código 1332.
 * Excepción propia del contexto de inventario (desacoplada de branch vía
 * BranchChecker); comparte semántica pero no código con la del contexto branch.
 */
export class BranchNotFoundException extends DomainException {
    constructor(branchId: string) {
        super({
            code: '1332',
            detail: `La sucursal ${branchId} no existe o no está disponible.`
        });
    };
};
