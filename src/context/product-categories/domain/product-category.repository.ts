import { Paginated } from "@/interfaces";

import { ProductCategory } from "./product-category.aggregate";
import { CategoryListItem, SearchCategoriesFilters } from "./interfaces/category.search";

export abstract class ProductCategoryRepository {
    abstract save(category: ProductCategory): Promise<void>;

    abstract findById(categoryId: string, tenantId: string): Promise<ProductCategory | null>;

    abstract existsByName(name: string, tenantId: string, excludeId?: string): Promise<boolean>;

    abstract update(category: ProductCategory): Promise<void>;

    abstract search(filters: SearchCategoriesFilters): Promise<Paginated<CategoryListItem>>;
}
