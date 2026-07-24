import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ProductCategoryChecker } from "@/context/products/application/ports/product-category-checker";
import { ProductCategoryEntity } from "@/context/product-categories/infrastructure/persistence/models/product-category.entity";

@Injectable()
export class ProductCategoryCheckerAdapter
    implements ProductCategoryChecker {
    constructor(
        @InjectRepository(ProductCategoryEntity)
        private readonly repository: Repository<ProductCategoryEntity>,
    ) { }

    async existsForTenant(
        productCategoryId: string,
    ): Promise<boolean> {

        const category = await this.repository.findOne({
            where: {
                id: productCategoryId,
            },
        });

        return category !== null;
    }
}