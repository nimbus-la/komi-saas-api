export interface CategoryPrimitives {
    id: string;
    tenantId: string;
    name: string;
    description: string | undefined;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/** Categoría tal como sale en el listado: sus datos más cuántos productos tiene asociados. */
export interface CategoryListItem extends CategoryPrimitives {
    productCount: number;
}
