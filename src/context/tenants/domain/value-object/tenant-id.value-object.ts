import { generateUUID, Uuid } from "@/shared";

export class TenantId extends Uuid {
    private constructor(value: string) {
        super(value);
    };

    public static create(value: string): TenantId {
        return new TenantId(value);
    };

    public static generate(): TenantId {
        return new TenantId(generateUUID());
    };
};