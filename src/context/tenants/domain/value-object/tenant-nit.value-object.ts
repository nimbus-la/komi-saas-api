import { DomainException } from "@/shared";

export class InvalidTenantNitException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1005',
            detail: `NIT de tenant inválido: ${reason}.`
        });
    };
};

export class TenantNitAlreadyExistsException extends DomainException {
    constructor(nit: string) {
        super({
            code: '1202',
            detail: `El NIT "${nit}" ya esta registrado.`
        });
    };
};

export class TenantNit {
    private static readonly MIN_LENGTH = 8;
    private static readonly MAX_LENGTH = 15;

    private constructor(public readonly value: string) {};

    public static create(raw: string): TenantNit {
        const value = raw.trim();

        if(value.length < this.MIN_LENGTH) {
            throw new InvalidTenantNitException(`debe tener al menos ${this.MIN_LENGTH} caracteres`);
        };

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidTenantNitException(`debe tener como máximo ${this.MAX_LENGTH} caracteres`);
        };

    /** if (!/^\d+$/.test(value)) {
            throw new InvalidTenantNitException('debe contener solo dígitos');
        };*/

        return new TenantNit(value);
    };

    public equals(other: TenantNit): boolean {
        return this.value === other.value;
    }
};