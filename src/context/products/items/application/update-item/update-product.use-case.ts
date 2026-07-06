import { Money } from "@/shared";

import {
    ProductId,
    ProductName,
    ProductNotFoundException,
    ProductRepository,
    ProductSku,
    UpdateProductApplicationParams,
} from "../../domain";

export class UpdateProductUseCase {
    constructor(
        private readonly repository: ProductRepository,
    ) { }

    public async execute(
        params: UpdateProductApplicationParams,
    ): Promise<void> {

        const product = await this.repository.findById(
            ProductId.create(params.id),
        );

        if (!product) {
            throw new ProductNotFoundException(params.id);
        }

        product.update({
            productCategoryId: params.productCategoryId,
            productName: ProductName.create(params.productName),
            productDescription: params.productDescription,
            productSku: ProductSku.create(params.productSku),
            productImgUrl: params.productImgUrl,
            productBasePrice: Money.of(params.productBasePrice),
            profitMargin: params.profitMargin,
            productStatus: params.productStatus,
        });

        await this.repository.update(product);
    }
}