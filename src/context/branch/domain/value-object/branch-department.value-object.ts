import { InvalidBranchDepartmentException } from "../exceptions/branch-exceptions";


export class BranchDepartment {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 50;

    private constructor(public readonly value: string) {}

    public static create(raw: string): BranchDepartment {
        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidBranchDepartmentException(`mínimo ${this.MIN_LENGTH} caracteres`);
        };

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidBranchDepartmentException(`máximo ${this.MAX_LENGTH} caracteres`);
        };

        return new BranchDepartment(value);
    };

    public equals(other: BranchDepartment): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    };
};