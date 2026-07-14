/** Puerto: el inventario solo necesita saber si una sucursal existe. */
export abstract class BranchChecker {
    abstract exists(branchId: string): Promise<boolean>;
};