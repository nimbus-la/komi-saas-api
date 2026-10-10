import { Pagination } from "@/interfaces";
import { EntityStatus } from "@/shared";

import { CategoryPrimitives } from "./category.primitives";


/** Categoría tal como sale en el listado: sus datos más cuántos productos tiene asociados. */
export interface CategoryListItem extends CategoryPrimitives {
    productCount: number;
}


export interface SearchCategoriesFilters extends Pagination {
    tenantId: string;
    categoryId?: string | undefined;
    text?: string | undefined;
    status?: EntityStatus | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}