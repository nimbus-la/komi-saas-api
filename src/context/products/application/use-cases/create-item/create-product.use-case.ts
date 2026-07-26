import { EventPublisher, Money, Quantity } from "@/shared";

import { CreateProductApplicationParams } from "@/context/products/domain/types/product-application";
import { ProductName } from "@/context/products/domain/value-object/product-name.value-object";
import { ProductSku } from "@/context/products/domain/value-object/product-sku.value-object";
import { TenantChecker } from "../../ports/tenant-checker";
import { ProductCategoryChecker } from "../../ports/product-category-checker";
import { InventoryItemChecker } from "../../ports/inventory-item-checker";
import { ProductCategoryNotFoundException } from "@/context/product-categories";

import {
    InventoryItemNotValidForTenantException,
    Product,
    ProductNameAlreadyExistsException,
    ProductRepository,
    TenantNotFoundException,
} from "@/context/products/domain";

export class CreateProductUseCase {
    constructor(
        private readonly repository: ProductRepository,
        private readonly tenantChecker: TenantChecker,
        private readonly categoryChecker: ProductCategoryChecker,
        private readonly inventoryChecker: InventoryItemChecker,
        private readonly eventPublisher: EventPublisher,

    ) { }

    public async execute(
        params: CreateProductApplicationParams,
    ): Promise<Product> {
        const tenantExists = await this.tenantChecker.exists(
            params.tenantId,
        );

        if (!tenantExists) {
            throw new TenantNotFoundException(
                params.tenantId,
            );
        }

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

        for (const ingredient of params.recipe ?? []) {

            const exists = await this.inventoryChecker.existsForTenant(
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

        const productName = ProductName.create(
            params.productName,
        );

        if (
            await this.repository.existsByName(
                productName,
                params.tenantId,
            )
        ) {
            throw new ProductNameAlreadyExistsException(
                productName.value,
            );
        }

        const sequence =
            await this.repository.nextSkuSequence();

        const product = Product.create({
            tenantId: params.tenantId,
            productCategoryId: params.productCategoryId,
            productName,
            productDescription: params.productDescription,
            productSku: ProductSku.fromNumber(sequence),
            productImgUrl: params.productImgUrl,
            productBasePrice: Money.of(params.productBasePrice),
            profitMargin: params.profitMargin,

        });

        for (const ingredient of params.recipe ?? []) {
            product.addIngredient({
                inventoryItemId:
                    ingredient.inventoryItemId,

                quantity:
                    Quantity.of(
                        ingredient.quantity,
                    ),

                isOptional:
                    ingredient.isOptional,
            });
        }
        await this.repository.save(product);

        await this.eventPublisher.publish(
            product.getDomainEvents(),
        );

        product.clearDomainEvents();

        return product;
    }
}