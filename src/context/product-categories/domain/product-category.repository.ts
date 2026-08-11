import { ProductCategory } from "./product-category.aggregate";

export abstract class ProductCategoryRepository {
    abstract save(category: ProductCategory): Promise<void>;

    abstract findAll(): Promise<ProductCategory[]>;

    abstract findById(id: string): Promise<ProductCategory | null>;

    abstract existsByName(name: string, tenantId: string): Promise<boolean>;

    abstract update(category: ProductCategory): Promise<void>;

    abstract search(params: { tenantId: string; text?: string; id?: string; isActive?: boolean; createdAt?: string; updatedAt?: string; page?: number; limit?: number; }): Promise<{ data: ProductCategory[]; total: number; }>;
}