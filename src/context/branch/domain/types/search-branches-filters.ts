export interface SearchBranchesFilters {
    tenantId: string;
    branchId?: string;
    /** Busca en nombre, dirección, teléfono, ciudad y departamento. */
    text?: string;
    branchStatus?: boolean;
}
