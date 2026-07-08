import { generateUUID, Uuid } from "@/shared";

export class TenantAccountId extends Uuid {
    private constructor(value: string) {
        super(value);
    };

    public static create(value: string): TenantAccountId {
        return new TenantAccountId(value);
    };

    public static generate(): TenantAccountId {
        return new TenantAccountId(generateUUID());
    };
};