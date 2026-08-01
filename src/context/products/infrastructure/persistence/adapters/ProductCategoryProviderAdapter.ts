import { ProductCategoryEntity } from "@/context/product-categories";
import { ProductCategoryProvider } from "@/context/products/application/ports/ProductCategoryProvider";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ProductCategoryProviderAdapter
    implements ProductCategoryProvider {

    constructor(
        @InjectRepository(ProductCategoryEntity)
        private readonly repository: Repository<ProductCategoryEntity>,
    ) { }

    async get(
        tenantId: string,
        productCategoryId: string,
    ): Promise<{ name: string } | null> {

        const category = await this.repository.findOne({
            where: {
                id: productCategoryId,
                tenantId,
            },
        });

        if (!category) {
            return null;
        }

        return {
            name: category.name,
        };
    }
}