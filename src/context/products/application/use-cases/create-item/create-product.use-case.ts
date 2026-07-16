import { Money } from "@/shared";
import { Product, ProductNameAlreadyExistsException, ProductRepository } from "@/context/products/domain";
import { CreateProductApplicationParams } from "@/context/products/domain/types/product-application";
import { ProductName } from "@/context/products/domain/value-object/product-name.value-object";
import { ProductSku } from "@/context/products/domain/value-object/product-sku.value-object";

export class CreateProductUseCase {
    constructor(
        private readonly repository: ProductRepository,
    ) { }

    public async execute(
        params: CreateProductApplicationParams,
    ): Promise<Product> {

        const productName = ProductName.create(params.productName);

        if (await this.repository.existsByName(productName)) {
            throw new ProductNameAlreadyExistsException(
                productName.value,
            );
        }

        const sequence = await this.repository.nextSkuSequence();

        const product = Product.create({
            productCategoryId: params.productCategoryId,
            productName,
            productDescription: params.productDescription,
            productSku: ProductSku.fromNumber(sequence),
            productImgUrl: params.productImgUrl,
            productBasePrice: Money.of(params.productBasePrice),
            profitMargin: params.profitMargin,
        });

        await this.repository.save(product);

        return product;
    }
}