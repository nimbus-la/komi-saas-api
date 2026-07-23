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
        );

        if (!product) {
            throw new ProductNotFoundException(params.id);
        }

        const current = product.toPrimitives();

        product.update({
            productCategoryId:
                params.productCategoryId ?? current.productCategoryId,

            productName:
                params.productName
                    ? ProductName.create(params.productName)
                    : ProductName.create(current.productName),

            productDescription:
                params.productDescription ?? current.productDescription,

            productImgUrl:
                params.productImgUrl ?? current.productImgUrl,

            productBasePrice:
                params.productBasePrice !== undefined
                    ? Money.of(params.productBasePrice)
                    : Money.of(current.productBasePrice),

            profitMargin:
                params.profitMargin ?? current.profitMargin,
        });
        if (params.productStatus !== undefined) {
            if (params.productStatus) {
                product.activate();
            } else {
                product.deactivate();
            }
        }

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