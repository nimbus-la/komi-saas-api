import { AggregateRoot, Money } from "@/shared";

import { ProductCreatedEvent } from "./events/product-created.event";
import { ProductId } from "./value-object/product-id.value-object";
import { ProductName } from "./value-object/product-name.value-object";
import { ProductSku } from "./value-object/product-sku.value-object";
import { ProductPrimitives } from "./types/product-primitives";


export class Product extends AggregateRoot<ProductId> {
    private tenantId: string;
    private productCategoryId: string;
    private productName: ProductName;
    private productDescription: string | undefined;
    private productSku: ProductSku;
    private productImgUrl: string | undefined;

    private productBasePrice: Money;
    private profitMargin: number;
    private productStatus: boolean;

    private constructor(
        id: ProductId,
        tenantId: string,
        productCategoryId: string,
        productName: ProductName,
        productDescription: string | undefined,
        productSku: ProductSku,
        productImgUrl: string | undefined,
        productBasePrice: Money,
        profitMargin: number,
        productStatus: boolean,
    ) {
        super(id);
        this.tenantId = tenantId;
        this.productCategoryId = productCategoryId;
        this.productName = productName;
        this.productDescription = productDescription;
        this.productSku = productSku;
        this.productImgUrl = productImgUrl;
        this.productBasePrice = productBasePrice;
        this.profitMargin = profitMargin;
        this.productStatus = productStatus;
    }

    public static create(params: {
        tenantId: string;
        productCategoryId: string;
        productName: ProductName;
        productDescription: string | undefined;
        productSku: ProductSku;
        productImgUrl: string | undefined;
        productBasePrice: Money;
        profitMargin: number;
    }): Product {

        const product = new Product(
            ProductId.generate(),
            params.tenantId,
            params.productCategoryId,
            params.productName,
            params.productDescription,
            params.productSku,
            params.productImgUrl,
            params.productBasePrice,
            params.profitMargin,
            true,
        );

        product.registerEvent(
            new ProductCreatedEvent({
                productId: product.id.value,
                tenantId: product.tenantId,
                productCategoryId: product.productCategoryId,
                productName: product.productName.value,
                productDescription: product.productDescription,
                productSku: product.productSku.value,
                productImgUrl: product.productImgUrl,
                productBasePrice: product.productBasePrice.getAmount(),
                costCurrency: product.productBasePrice.currency,
                profitMargin: product.profitMargin,
                productStatus: product.productStatus,
            }),
        );

        return product;
    }

    public toPrimitives(): ProductPrimitives {
        return {
            id: this.id.value,
            tenantId: this.tenantId,
            productCategoryId: this.productCategoryId,
            productName: this.productName.value,
            productDescription: this.productDescription,
            productSku: this.productSku.value,
            productImgUrl: this.productImgUrl,
            productBasePrice: this.productBasePrice.getAmount(),
            costCurrency: this.productBasePrice.currency,
            profitMargin: this.profitMargin,
            productStatus: this.productStatus,
        };
    }

    public static fromPrimitives(
        primitives: ProductPrimitives,
    ): Product {
        return new Product(
            ProductId.create(primitives.id),
            primitives.tenantId,
            primitives.productCategoryId,
            ProductName.create(primitives.productName),
            primitives.productDescription,
            ProductSku.fromValue(primitives.productSku),
            primitives.productImgUrl,
            Money.of(primitives.productBasePrice, primitives.costCurrency),
            primitives.profitMargin,
            primitives.productStatus,
        );
    }

    public deactivate(): void {
        if (!this.productStatus) {
            throw new Error("El producto ya se encuentra desactivado.");
        }

        this.productStatus = false;
    }

    public activate(): void {
        if (this.productStatus) {
            throw new Error("El producto ya se encuentra activado.");
        }

        this.productStatus = true;
    }
    public update(params: {
        productCategoryId: string;
        productName: ProductName;
        productDescription: string | undefined;
        productImgUrl: string | undefined;
        productBasePrice: Money;
        profitMargin: number;
        productStatus: boolean;
    }): void {
        this.productCategoryId = params.productCategoryId;
        this.productName = params.productName;
        this.productDescription = params.productDescription;
        this.productImgUrl = params.productImgUrl;
        this.productBasePrice = params.productBasePrice;
        this.profitMargin = params.profitMargin;
        this.productStatus = params.productStatus;
    }
}