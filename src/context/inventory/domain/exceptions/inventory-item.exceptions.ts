import { DomainException } from "@/shared";
import { MeasurementUnit } from "../common/constants.common";


/**
 * Estándar de códigos de error del inventario: 1300-1399.
 *   1300-1309  Item (catálogo)
 *   1310-1319  Lote (batch)
 *   1320-1329  Movimientos de stock (consumo/merma/conteo)
 *   1330-1339  Sucursal (scope dentro de inventario)
 *   1340-1349  Configuración de sucursal (mínimos)
 *   1350-1359  Reglas de actualización del item
 */



// ---- 1300-1309: Item (catálogo) ----

/** Nombre del item inválido (longitud/formato). Código 1300. */
export class InvalidInventoryNameException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1300',
            detail: `Nombre de item inválido: ${reason}.`
        });
    };
};



/** Unidad de medida fuera del catálogo permitido (MeasurementUnit). Código 1301. */
export class InvalidInventoryUnitException extends DomainException {
    constructor(value: string) {
        const allowed = Object.values(MeasurementUnit).join(', ');

        super({
            code: '1301',
            detail: `Unidad de medida "${value}" no soportada. Permitidas: ${allowed}.`
        });
    };
};



/** Se intenta crear un item con un nombre que ya existe (unicidad). Código 1302. */
export class InventoryItemNameAlreadyExistsException extends DomainException {
    constructor(name: string) {
        super({
            code: '1302',
            detail: `El nombre "${name}" ya está registrado en el inventario.`,
        });
    };
};



/** No existe un item con el id dado. Código 1303. */
export class InventoryItemNotFoundException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1303',
            detail: `No se encontró el item de inventario ${itemId}.`
        });
    };
};



/** Se intenta recibir mercancía en un item inactivo. Código 1304. */
export class InactiveItemException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1304',
            detail: `El item ${itemId} está inactivo y no admite recepciones de mercancía.`
        });
    };
};



/**
 * Se intenta crear un item para un tenant que no existe. Código 1305.
 * Excepción propia del contexto de inventario (desacoplada de tenants vía
 * TenantChecker); comparte semántica pero no código con la del contexto tenants.
 */
export class TenantNotFoundException extends DomainException {
    constructor(tenantId: string) {
        super({
            code: '1305',
            detail: `El tenant ${tenantId} no existe; no se puede crear el item.`
        });
    };
};



// ---- 1310-1319: Lote (batch) ----

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



// ---- 1320-1329: Movimientos de stock ----

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



// ---- 1330-1339: Sucursal (scope dentro de inventario) ----

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



// ---- 1340-1349: Configuración de sucursal (mínimos) ----

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



// ---- 1350-1359: Reglas de actualización del item ----

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
