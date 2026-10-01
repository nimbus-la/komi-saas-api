import { Injectable } from "@nestjs/common";

import { ProductRepository } from "@/context/products/domain/product.repository";
import { ProductId } from "@/context/products/domain/value-object/product-id.value-object";
import { ProductChecker } from "../../../application/ports/product-checker";

@Injectable()
export class ProductCheckerAdapter implements ProductChecker {
    constructor(
        private readonly products: ProductRepository,
    ) { };

    public async existsInTenant(productId: string, tenantId: string): Promise<boolean> {
        const product = await this.products.findById(ProductId.create(productId), tenantId);

        return product !== null;
    };
};
