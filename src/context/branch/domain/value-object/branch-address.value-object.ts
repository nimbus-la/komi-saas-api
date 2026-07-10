import { DomainException } from "@/shared";

export class InvalidBranchAddressException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1010',
            detail: `Dirección de la sucursal inválida: ${reason}.`
        });
    };
};

export class BranchAddress {
    private static readonly MIN_LENGTH = 5;
    private static readonly MAX_LENGTH = 100;

    private constructor(public readonly value: string) {}

    public static create(raw: string): BranchAddress {
        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidBranchAddressException(`mínimo ${this.MIN_LENGTH} caracteres`);
        };

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidBranchAddressException( `máximo ${this.MAX_LENGTH} caracteres` );
        };

        return new BranchAddress(value);
    }

    public equals(other: BranchAddress): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    }
}