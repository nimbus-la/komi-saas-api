import { Money } from "@/shared";
import {
    Product,
    ProductNameAlreadyExistsException,
    ProductRepository,
} from "@/context/products/domain";
import { CreateProductApplicationParams } from "@/context/products/domain/types/product-application";
import { ProductName } from "@/context/products/domain/value-object/product-name.value-object";
import { ProductSku } from "@/context/products/domain/value-object/product-sku.value-object";
import { TenantChecker } from "../../ports/tenant-checker";

export class CreateProductUseCase {
    constructor(
        private readonly repository: ProductRepository,
        private readonly tenantChecker: TenantChecker,
    ) { }

    public async execute(
        params: CreateProductApplicationParams,
    ): Promise<Product> {

        // 1. Validar que el tenant exista
        const tenantExists = await this.tenantChecker.exists(
            params.tenantId,
        );

        if (!tenantExists) {
            throw new Error("Tenant no encontrado");
        }

        // 2. Crear el Value Object del nombre
        const productName = ProductName.create(params.productName);

        // 3. Validar que no exista otro producto con ese nombre en el tenant
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

        // 4. Obtener el siguiente SKU
        const sequence = await this.repository.nextSkuSequence();

        // 5. Crear el producto
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

        await this.repository.save(product);

        return product;
    }
}