import { DomainException } from "@/shared";
import { MeasurementUnit } from "../common/constants.common";


export class InvalidInventoryNameException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1002',
            detail: `Nombre de item inválido: ${reason}.`
        });
    };
};



export class InventoryItemNameAlreadyExistsException extends DomainException {
    constructor(name: string) {
        super({
            code: '1200',
            detail: `El nombre "${name}" ya está registrado en el inventario.`,
        });
    };
};



export class InvalidInventoryUnitException extends DomainException {
    constructor(value: string) {
        const allowed = Object.values(MeasurementUnit).join(', ');

        super({
            code: '1001',
            detail: `Unidad de medida "${value}" no soportada. Permitidas: ${allowed}.`
        });
    };
};



export class InvalidExpirationDateException extends DomainException {
    constructor(detail: string) {
        super({
            code: '1300',
            detail: `Fecha de vencimiento inválida: ${detail}.`
        });
    };
};



export class InactiveItemException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1320',
            detail: `El item ${itemId} está inactivo y no admite recepciones de mercancía.`
        });
    };
};


export class PerishableRequiresExpirationException extends DomainException {
    constructor(itemId: string) {
        super({
            code: '1321',
            detail: `El item ${itemId} es perecedero y requiere fecha de vencimiento en el lote.`
        });
    };
};


export class NonPositiveConsumptionException extends DomainException {
    constructor() {
        super({
            code: '1322',
            detail: 'La cantidad a consumir debe ser mayor a cero.'
        });
    };
};


export class InsufficientStockException extends DomainException {
    constructor(itemId: string, requested: string, available: string) {
        super({
            code: '1323',
            detail: `Stock insuficiente para el item ${itemId}: se solicitaron ${requested} y hay ${available} disponibles.`
        });
    };
};