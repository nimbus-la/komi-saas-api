import { InvalidTenantNameException } from "../exceptions/tenant-exceptions";


export class TenantName {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 30;

    private constructor(public readonly value: string) { };

    public static create(raw: string): TenantName {
        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidTenantNameException(`mínimo ${this.MIN_LENGTH} caracteres`);
        }

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidTenantNameException(`máximo ${this.MAX_LENGTH} caracteres`);
        }

        return new TenantName(value);
    }

    public equals(other: TenantName): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    }
};