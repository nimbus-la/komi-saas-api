import { Money } from "@/shared";

import {
    CreateProductApplicationParams,
    Product,
    ProductName,
    ProductNameAlreadyExistsException,
    ProductRepository,
    ProductSku,
} from "../../domain";

export class CreateProductUseCase {
    constructor(
        private readonly repository: ProductRepository,
    ) { }

    public async execute(
        params: CreateProductApplicationParams,
    ): Promise<void> {

        const productName = ProductName.create(params.productName);

        if (await this.repository.existsByName(productName)) {
            throw new ProductNameAlreadyExistsException(
                productName.value,
            );
        }

        const product = Product.create({
            productCategoryId: params.productCategoryId,
            productName,
            productDescription: params.productDescription,
            productSku: ProductSku.create(params.productSku),
            productImgUrl: params.productImgUrl,
            productBasePrice: Money.of(params.productBasePrice),
            profitMargin: params.profitMargin,
        });

        await this.repository.save(product);
    }
}