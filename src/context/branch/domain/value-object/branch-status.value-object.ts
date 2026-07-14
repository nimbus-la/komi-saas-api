export class BranchStatus {
    private constructor(public readonly value: boolean) {}

    public static create(value: boolean): BranchStatus {
        return new BranchStatus(value);
    }

    public equals(other: BranchStatus): boolean {
        return this.value === other.value;
    }
}