import { generateUUID, Uuid } from "@/shared";

export class RolId extends Uuid {
    private constructor(value: string) {
        super(value);
    };

    public static create(value: string): RolId {
        return new RolId(value);
    };

    public static generate(): RolId {
        return new RolId(generateUUID());
    };
};