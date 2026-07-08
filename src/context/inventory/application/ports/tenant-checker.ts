/** El inventario solo necesita saber si un tenant existe, sin
 *  conocer el contexto de tenants. La implementación vive en infraestructura. */
export abstract class TenantChecker {
    abstract exists(tenantId: string): Promise<boolean>;
};