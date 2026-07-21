import { InvalidBranchPhoneException } from "../exceptions/branch-exceptions";


export class BranchPhone {
    private static readonly MIN_LENGTH = 7;
    private static readonly MAX_LENGTH = 15;

    private constructor(public readonly value: string) {}

    public static create(raw: string): BranchPhone {
        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidBranchPhoneException(`mínimo ${this.MIN_LENGTH} caracteres`);
        };

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidBranchPhoneException(`máximo ${this.MAX_LENGTH} caracteres`);
        };

        return new BranchPhone(value);
    }

    public equals(other: BranchPhone): boolean {
        return this.value === other.value;
    }
}