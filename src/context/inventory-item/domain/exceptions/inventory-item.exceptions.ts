import { DomainException } from "@/shared";
import { MeasurementUnit } from "../value-objects/inventory-item-unit.value-object";


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