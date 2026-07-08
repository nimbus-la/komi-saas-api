export class TenantStatus {    
    private constructor(public readonly value: boolean) {}

    public static create(value: boolean): TenantStatus {
        return new TenantStatus(value); 
    };

    public static active(): TenantStatus {
        return new TenantStatus(true);
    };

    public static inactive(): TenantStatus {
        return new TenantStatus(false);
    };

    public equals(status: TenantStatus): boolean {
        return this.value === status.value;
    };
};