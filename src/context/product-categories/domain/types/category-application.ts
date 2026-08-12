/**
 * Contratos de entrada del contexto de categorías.
 *
 * Viven en el dominio para que controller, casos de uso y repositorio hablen
 * exactamente la misma forma y no se dupliquen (ni se desincronicen) los campos.
 * La paginación no va aquí: se maneja con `Pagination` de `@/interfaces`.
 */

export interface CreateCategoryApplicationParams {
    tenantId: string;
    name: string;
    description?: string | undefined;
}

export interface UpdateCategoryApplicationParams {
    tenantId: string;
    name?: string | undefined;
    description?: string | undefined;
    isActive?: boolean | undefined;
}

export interface SearchCategoriesFilters {
    tenantId: string;
    text?: string | undefined;
    id?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}
