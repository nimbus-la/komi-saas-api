import { BasePriceError, EventPublisher, Money } from "@/shared";

import { CreateProductApplicationParams } from "@/context/products/domain/interfaces/product-application";
import { ProductName } from "@/context/products/domain/value-object/product-name.value-object";
import { ProductSku } from "@/context/products/domain/value-object/product-sku.value-object";
import { TenantChecker } from "../../ports/tenant-checker";
import { ProductCategoryChecker } from "../../ports/product-category-checker";
import { ProductCategoryNotFoundException } from "@/context/product-categories";

// Recetas: desconectado en esta versión.
// import { Quantity } from "@/shared";
// import { InventoryItemChecker } from "../../ports/inventory-item-checker";
// import { InventoryItemNotValidForTenantException } from "@/context/products/domain/recipe/exceptions/inventory-item-not-valid-for-tenant.exception";

import {
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
        private readonly eventPublisher: EventPublisher,
        // Recetas: desconectado en esta versión.
        // private readonly inventoryChecker: InventoryItemChecker,
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

        // Recetas: desconectado en esta versión.
        // for (const ingredient of params.recipe ?? []) {
        //
        //     const exists = await this.inventoryChecker.existsForTenant(
        //         params.tenantId,
        //         ingredient.inventoryItemId,
        //     );
        //
        //     if (!exists) {
        //         throw new InventoryItemNotValidForTenantException(
        //             ingredient.inventoryItemId,
        //             params.tenantId,
        //         );
        //     }
        // }

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

        const productBasePrice = Money.of(params.productBasePrice);

        if (productBasePrice.getAmount() === "0.00") {
            throw new BasePriceError(
                "El precio base del producto debe ser mayor que 0."
            );
        }
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

        // Recetas: desconectado en esta versión.
        // for (const ingredient of params.recipe ?? []) {
        //     product.addIngredient({
        //         inventoryItemId:
        //             ingredient.inventoryItemId,
        //
        //         quantity:
        //             Quantity.of(
        //                 ingredient.quantity,
        //             ),
        //
        //         isOptional:
        //             ingredient.isOptional,
        //     });
        // }
        await this.repository.save(product);

        await this.eventPublisher.publish(
            product.getDomainEvents(),
        );

        product.clearDomainEvents();

        return product;
    }
}
