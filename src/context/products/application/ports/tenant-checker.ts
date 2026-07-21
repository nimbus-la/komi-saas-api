
export abstract class TenantChecker {
    abstract exists(tenantId: string): Promise<boolean>;
};