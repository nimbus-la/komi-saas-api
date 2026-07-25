import { DomainException } from "@/shared";
import { MeasurementUnit } from "../common/constants.common";


/**
 * Item (catálogo). Códigos 1300-1309.
 * Estándar de errores del inventario: 1300-1399 (ver README de exceptions/).
 */



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
