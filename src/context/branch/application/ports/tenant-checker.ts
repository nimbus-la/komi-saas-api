/** Puerto: la creación de sucursales necesita saber si el negocio existe. */
export abstract class TenantChecker {
    abstract exists(tenantId: string): Promise<boolean>;
}
