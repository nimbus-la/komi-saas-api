/**
 * Puerto: el inventario necesita saber si una sucursal existe DENTRO del negocio
 * con el que se está trabajando.
 *
 * El tenantId no es opcional a propósito. Preguntar solo por el id dejaba pasar
 * la sucursal de otro negocio, que es justo lo que hay que impedir.
 */
export abstract class BranchChecker {
    abstract existsInTenant(branchId: string, tenantId: string): Promise<boolean>;
};