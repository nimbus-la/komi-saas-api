import { Paginated, Pagination } from "@/interfaces";

import { ProductCategory } from "./product-category.aggregate";
import { SearchCategoriesFilters } from "./types/category-application";

export abstract class ProductCategoryRepository {
    abstract save(category: ProductCategory): Promise<void>;

    /** Siempre acotado al tenant: una categoría de otro tenant no existe. */
    abstract findById(
        id: string,
        tenantId: string,
    ): Promise<ProductCategory | null>;

    /**
     * @param excludeId id a ignorar en la comparación (el propio, al renombrar).
     */
    abstract existsByName(
        name: string,
        tenantId: string,
        excludeId?: string,
    ): Promise<boolean>;

    abstract update(category: ProductCategory): Promise<void>;

    abstract search(
        filters: SearchCategoriesFilters,
        pagination: Pagination,
    ): Promise<Paginated<ProductCategory>>;
}
