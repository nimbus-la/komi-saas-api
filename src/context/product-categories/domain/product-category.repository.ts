import { Paginated } from "@/interfaces";

import { ProductCategory } from "./product-category.aggregate";
import { CategoryListItem, SearchCategoriesFilters } from "./interfaces/category.search";

export abstract class ProductCategoryRepository {
    abstract save(category: ProductCategory): Promise<void>;

    abstract findById(categoryId: string, tenantId: string): Promise<ProductCategory | null>;

    /**
     * Indica si otra categoría del mismo negocio ya usa el nombre de esta, sin
     * distinguir mayúsculas. Las eliminadas no cuentan porque su nombre queda libre.
     * La propia categoría se ignora, así que sirve igual al crear y al renombrar.
     */
    abstract isNameTaken(category: ProductCategory): Promise<boolean>;

    abstract update(category: ProductCategory): Promise<void>;

    /** Consulta el total de productos asociados a una categoria. Eliminados y archivados no cuentan. */
    abstract countProducts(categoryId: string, tenantId: string): Promise<number>;

    abstract search(filters: SearchCategoriesFilters): Promise<Paginated<CategoryListItem>>;
}
