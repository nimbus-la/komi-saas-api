import { ProductCategory } from "./product-category.aggregate";

export abstract class ProductCategoryRepository {
    abstract save(category: ProductCategory): Promise<void>;

    abstract findAll(): Promise<ProductCategory[]>;

    abstract findById(id: string): Promise<ProductCategory | null>;

    abstract existsByName(name: string): Promise<boolean>;

    abstract update(category: ProductCategory): Promise<void>;

    abstract search(params: { estado?: boolean }): Promise<ProductCategory[]>;
}