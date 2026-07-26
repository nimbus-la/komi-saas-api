import { Injectable } from "@nestjs/common";
import { ProductCategoryRepository } from "@/context/product-categories/domain/product-category.repository";
import { ProductCategoryChecker } from "@/context/products/application/ports/product-category-checker";

@Injectable()
export class ProductCategoryCheckerAdapter
    implements ProductCategoryChecker {

    constructor(
        private readonly categories: ProductCategoryRepository,
    ) { }

    async existsForTenant(
        tenantId: string,
        categoryId: string,
    ): Promise<boolean> {

        const categories = await this.categories.search({
            tenantId,
            id: categoryId,
        });

        return categories.length > 0;
    }
}