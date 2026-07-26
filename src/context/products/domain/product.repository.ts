import { Product } from "./product.aggregate";
import { SearchProductsApplicationParams } from "./types/product-application";
import { ProductResponse } from "./types/product.response";
import { ProductId } from "./value-object/product-id.value-object";
import { ProductName } from "./value-object/product-name.value-object";

export abstract class ProductRepository {
    abstract save(product: Product): Promise<void>;

    abstract update(product: Product): Promise<void>;

    abstract search(
        params: SearchProductsApplicationParams,
    ): Promise<ProductResponse[]>;

    public abstract findById(
        id: ProductId,
        ternand: string,
    ): Promise<Product | null>;

    abstract existsByName(
        name: ProductName,
        tenantId: string,
    ): Promise<boolean>;

    abstract nextSkuSequence(): Promise<number>;
}