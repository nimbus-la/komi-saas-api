import { Money, Quantity } from "@/shared";

import {
    ProductNotFoundException,
    ProductRepository,
} from "../../../domain";
import { UpdateProductApplicationParams } from "@/context/products/domain/types/product-application";
import { ProductId } from "@/context/products/domain/value-object/product-id.value-object";
import { ProductName } from "@/context/products/domain/value-object/product-name.value-object";

export class UpdateProductUseCase {
    constructor(
        private readonly repository: ProductRepository,
    ) { }

    public async execute(
        params: UpdateProductApplicationParams,
    ): Promise<void> {

        const product = await this.repository.findById(
            ProductId.create(params.id),
            params.tenantId,
        );

        if (!product) {
            throw new ProductNotFoundException(params.id);
        }

        product.update({
            productCategoryId: params.productCategoryId,
            productName: ProductName.create(params.productName),
            productDescription: params.productDescription,
            productImgUrl: params.productImgUrl,
            productBasePrice: Money.of(params.productBasePrice),
            profitMargin: params.profitMargin,
            productStatus: params.productStatus,
        });
        if (params.recipe) {
            product.replaceRecipe(
                params.recipe.map((ingredient) => ({
                    inventoryItemId: ingredient.inventoryItemId,
                    quantity: Quantity.of(ingredient.quantity),
                    isOptional: ingredient.isOptional,
                })),
            );
        }

        await this.repository.update(product);
    }
}