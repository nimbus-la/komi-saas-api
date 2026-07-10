import { DomainException } from "@/shared";

export class InvalidBranchCityException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1012',
            detail: `Ciudad de la sucursal inválida: ${reason}.`
        });
    }
}

export class BranchCity {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 50;

    private constructor(public readonly value: string) {}

    public static create(raw: string): BranchCity {
        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidBranchCityException(`mínimo ${this.MIN_LENGTH} caracteres`);
        };

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidBranchCityException(`máximo ${this.MAX_LENGTH} caracteres`);
        };

        return new BranchCity(value);
    };

    public equals(other: BranchCity): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    };
};