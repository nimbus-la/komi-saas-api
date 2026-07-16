/**
 * Puerto para verificar la existencia de un Tenant
 */
export abstract class TenantExistencePort {
    abstract exists(tenantId: string): Promise<boolean>;
}