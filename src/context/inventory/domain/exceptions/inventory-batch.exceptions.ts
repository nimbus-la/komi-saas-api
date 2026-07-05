import { DomainException } from "@/shared";

export class InvalidInventoryBatchQuantityException extends Error {
    constructor(message: string) {
        super(message);
        this.name = InvalidInventoryBatchQuantityException.name;
    };
};


export class InvalidInventoryBatchExpirationDateException extends Error {
    constructor(message: string) {
        super(message);
        this.name = InvalidInventoryBatchExpirationDateException.name;
    };
};


export class ExpiredInventoryBatchException extends Error {
    constructor(message: string) {
        super(message);
        this.name = ExpiredInventoryBatchException.name;
    };
};


export class InsufficientInventoryBatchQuantityException extends Error {
    constructor(message: string) {
        super(message);
        this.name = InsufficientInventoryBatchQuantityException.name;
    };
};


export class InventoryBatchAlreadyEmptyException extends Error {
    constructor(message: string) {
        super(message);
        this.name = InventoryBatchAlreadyEmptyException.name;
    };
};


export class EmptyBatchException extends DomainException {
    constructor() {
        super({ code: '1310', detail: 'La cantidad recibida del lote debe ser mayor a cero.' });
    };
};

export class InsufficientBatchQuantityException extends DomainException {
    constructor() {
        super({ code: '1311', detail: 'No hay cantidad suficiente en el lote para consumir.' });
    };
};