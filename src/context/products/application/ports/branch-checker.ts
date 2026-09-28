/**
 * Puerto: el listado de productos necesita saber si una sucursal existe DENTRO
 * del negocio antes de evaluar el stock de sus insumos en ella.
 *
 * El tenantId es obligatorio a propósito: preguntar solo por el id dejaría ver
 * el stock de la sucursal de otro negocio.
 */
export abstract class BranchChecker {
    abstract existsInTenant(branchId: string, tenantId: string): Promise<boolean>;
};
