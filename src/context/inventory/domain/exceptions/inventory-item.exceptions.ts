import { DomainException } from "@/shared";
import { MeasurementUnit } from "../common/constants.common";


/** Nombre del item inválido (longitud/formato). Código 1003. */
export class InvalidInventoryNameException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1003',
            detail: `Nombre de item inválido: ${reason}.`
        });
    };
};



/** Se intenta crear un item con un nombre que ya existe (unicidad). Código 1200. */
export class InventoryItemNameAlreadyExistsException extends DomainException {
    constructor(name: string) {
        super({
            code: '1200',
            detail: `El nombre "${name}" ya está registrado en el inventario.`,
        });
    };
};



/** Unidad de medida fuera del catálogo permitido (MeasurementUnit). Código 1001. */
export class InvalidInventoryUnitException extends DomainException {
    constructor(value: string) {
        const allowed = Object.values(MeasurementUnit).join(', ');

        super({
            code: '1001',
            detail: `Unidad de medida "${value}" no soportada. Permitidas: ${allowed}.`
        });
    };
};



/** Fecha de vencimiento no parseable o inválida al crear un lote. Código 1300. */
export class InvalidExpirationDateException extends DomainException {
    constructor(detail: string) {
        super({
            code: '1300',
            detail: `Fecha de vencimiento inválida: ${detail}.`
        });
    };
};



/** Se intenta recibir mercancía en un item inactivo. Código 1320. */
export class InactiveItemException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1320',
            detail: `El item ${itemId} está inactivo y no admite recepciones de mercancía.`
        });
    };
};



/** Item perecedero que recibe un lote sin fecha de vencimiento. Código 1321. */
export class PerishableRequiresExpirationException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1321',
            detail: `El item ${itemId} es perecedero y requiere fecha de vencimiento en el lote.`
        });
    };
};



/** Se intenta consumir una cantidad cero o negativa. Código 1322. */
export class NonPositiveConsumptionException extends DomainException {
    constructor() {
        super({
            code: '1322',
            detail: 'La cantidad a consumir debe ser mayor a cero.'
        });
    };
};



/** Se pide consumir más de lo disponible (suma de lotes activos). Código 1323. */
export class InsufficientStockException extends DomainException {
    constructor(itemId: string, requested: string, available: string) {
        super({
            code: '1323',
            detail: `Stock insuficiente para el item ${itemId}: se solicitaron ${requested} y hay ${available} disponibles.`
        });
    };
};



/** No existe un item con el id dado. Código 1201. */
export class InventoryItemNotFoundException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1201',
            detail: `No se encontró el item de inventario ${itemId}.`
        });
    };
};



export class UnitChangeNotAllowedException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1324',
            detail: `No se puede cambiar la unidad de medida del item ${itemId}: ya tiene lotes registrados.`
        });
    };
};



/** Se intenta cambiar la perecibilidad de un item que ya tiene lotes. Código 1325. */
export class PerishabilityChangeNotAllowedException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1325',
            detail: `No se puede cambiar la perecibilidad del item ${itemId}: ya tiene lotes registrados.`
        });
    };
};



/** Se intenta actualizar un item sin enviar ningún cambio. Código 1326. */
export class EmptyUpdateException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1326',
            detail: `No se enviaron cambios para actualizar el item ${itemId}.`
        });
    };
};



/** Se intenta crear un item para un tenant que no existe. Código 1202. */
export class TenantNotFoundException extends DomainException {
    constructor(tenantId: string) {
        super({
            code: '1205',
            detail: `El tenant ${tenantId} no existe; no se puede crear el item.`
        });
    };
};



/** La sucursal indicada no existe o no pertenece al tenant. Código 1330. */
export class BranchNotFoundException extends DomainException {
    constructor(branchId: string) {
        super({
            code: '1330',
            detail: `La sucursal ${branchId} no existe o no está disponible.`
        });
    };
};



/** Se intenta consumir sobre un agregado cargado con lotes de varias sucursales. Código 1331. */
export class AmbiguousBranchScopeException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1331',
            detail: `No se puede consumir el item ${itemId} sin especificar una sucursal: hay lotes de varias sedes cargados.`
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