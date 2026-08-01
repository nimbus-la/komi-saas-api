import { Money, Quantity } from "@/shared";
import { UpdateProductApplicationParams } from "@/context/products/domain/types/product-application";
import { ProductId } from "@/context/products/domain/value-object/product-id.value-object";
import { ProductName } from "@/context/products/domain/value-object/product-name.value-object";
import { InventoryItemChecker } from "../../ports/inventory-item-checker";
import { ProductCategoryChecker } from "../../ports/product-category-checker";

import {
    Product,
    ProductNotFoundException,
    ProductNotModifiedException,
    ProductRepository,
    TenantNotFoundException,
} from "../../../domain";
import { ProductCategoryNotFoundException } from "@/context/product-categories";
import { InventoryItemNotValidForTenantException } from "@/context/products/domain/recipe/exceptions/inventory-item-not-valid-for-tenant.exception";
import { TenantChecker } from "../../ports/tenant-checker";

export class UpdateProductUseCase {
    constructor(
        private readonly repository: ProductRepository,
        private readonly tenantChecker: TenantChecker,
        private readonly categoryChecker: ProductCategoryChecker,
        private readonly inventoryChecker: InventoryItemChecker,
    ) { }

    public async execute(
        params: UpdateProductApplicationParams,
    ): Promise<Product> {

        const tenantExists = await this.tenantChecker.exists(
            params.tenantId,
        );

        if (!tenantExists) {
            throw new TenantNotFoundException(
                params.tenantId,
            );
        }
        const product = await this.repository.findById(
            ProductId.create(params.id),
            params.tenantId,

        );

        if (!product) {
            throw new ProductNotFoundException(params.id);
        }
        if (params.productCategoryId) {

            const categoryExists =
                await this.categoryChecker.existsForTenant(
                    params.tenantId,
                    params.productCategoryId,
                );

            if (!categoryExists) {
                throw new ProductCategoryNotFoundException(
                    params.productCategoryId,
                );
            }
        }
        if (params.recipe) {

            for (const ingredient of params.recipe) {

                const exists =
                    await this.inventoryChecker.existsForTenant(
                        params.tenantId,
                        ingredient.inventoryItemId,
                    );

                if (!exists) {
                    throw new InventoryItemNotValidForTenantException(
                        params.tenantId,
                        ingredient.inventoryItemId,
                    );
                }
            }
        }
        const current = product.toPrimitives();

        const hasChanges =
            (params.productCategoryId !== undefined &&
                params.productCategoryId !== current.productCategoryId) ||

            (params.productName !== undefined &&
                params.productName !== current.productName) ||

            (params.productDescription !== undefined &&
                params.productDescription !== current.productDescription) ||

            (params.productImgUrl !== undefined &&
                params.productImgUrl !== current.productImgUrl) ||

            (params.productBasePrice !== undefined &&
                params.productBasePrice !== current.productBasePrice) ||

            (params.profitMargin !== undefined &&
                params.profitMargin.toPrimitives() !== current.profitMargin) ||

            (params.productStatus !== undefined &&
                params.productStatus !== current.productStatus) ||

            (params.recipe !== undefined);

        if (!hasChanges) {
            throw new ProductNotModifiedException();
        }

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

        return product;
    }
}