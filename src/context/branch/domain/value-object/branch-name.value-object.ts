import { InvalidBranchNameException } from "../exceptions/branch-exceptions";


export class BranchName {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 30;

    private constructor(public readonly value: string) {}

    public static create(raw: string): BranchName {
        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidBranchNameException(`mínimo ${this.MIN_LENGTH} caracteres`);
        };

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidBranchNameException(`máximo ${this.MAX_LENGTH} caracteres`);
        };

        return new BranchName(value);
    }

    public equals(other: BranchName): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    }
}