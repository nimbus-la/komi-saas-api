import { Pagination } from "@/interfaces";
import { CategoryPrimitives } from "./category.primitives";


/** Categoría tal como sale en el listado: sus datos más cuántos productos tiene asociados. */
export interface CategoryListItem extends CategoryPrimitives {
    productCount: number;
}


export interface SearchCategoriesFilters extends Pagination {
    tenantId: string;
    id?: string | undefined;
    text?: string | undefined;
    isActive?: boolean | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}