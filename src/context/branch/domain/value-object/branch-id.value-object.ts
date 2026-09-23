import { generateUUID, Uuid } from "@/shared";

/** Identificador único de la sucursal. */
export class BranchId extends Uuid {
    private constructor(value: string) {
        super(value);
    }

    public static create(value: string): BranchId {
        return new BranchId(value);
    }

    public static generate(): BranchId {
        return new BranchId(generateUUID());
    }
}