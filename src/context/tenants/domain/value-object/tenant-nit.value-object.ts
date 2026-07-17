import { InvalidTenantNitException } from "../exceptions/tenant-exceptions";

export class TenantNit {
    private static readonly MIN_LENGTH = 8;
    private static readonly MAX_LENGTH = 15;

    private constructor(public readonly value: string) {}

    public static create(raw: string): TenantNit {
        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidTenantNitException(
                `debe tener al menos ${this.MIN_LENGTH} caracteres`,
            );
        }

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidTenantNitException(
                `debe tener como máximo ${this.MAX_LENGTH} caracteres`,
            );
        }

        if (!/^[A-Za-z0-9./-]+$/.test(value)) {
            throw new InvalidTenantNitException(
                "solo puede contener letras, números, punto (.), guion (-) y barra (/)",
            );
        }

        return new TenantNit(value);
    }

    public equals(other: TenantNit): boolean {
        return this.value === other.value;
    }
}