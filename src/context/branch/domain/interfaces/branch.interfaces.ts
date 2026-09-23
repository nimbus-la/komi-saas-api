/** Datos planos de la sucursal que se usan para guardarla y reconstruirla. */
export interface BranchPrimitives {
    id: string;
    tenantId: string;
    name: string;
    address: string;
    phone: string;
    city: string;
    department: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}


/** Sucursal tal como se entrega en las consultas, sin la marca de borrado. */
export interface BranchResponse {
    id: string;
    tenantId: string;
    name: string;
    address: string;
    phone: string;
    city: string;
    department: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}


/** Datos que recibe el caso de uso para crear una sucursal. */
export interface CreateBranchApplicationParams {
    tenantId: string;
    name: string;
    address: string;
    phone: string;
    city: string;
    department: string;
}


/** Filtros para buscar sucursales, siempre dentro de un negocio. */
export interface SearchBranchesFilters {
    tenantId: string;
    branchId?: string;
    /** Texto que se busca en el nombre, la dirección, el teléfono, la ciudad y el departamento. */
    text?: string;
    branchStatus?: boolean;
}
