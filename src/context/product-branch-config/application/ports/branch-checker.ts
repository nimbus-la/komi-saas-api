/**
 * Puerto: la sucursal que se configura tiene que existir DENTRO del negocio.
 * El tenantId es obligatorio para no poder configurar sucursales de otro negocio.
 */
export abstract class BranchChecker {
    abstract existsInTenant(branchId: string, tenantId: string): Promise<boolean>;
};
