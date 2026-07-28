export abstract class ProductCategoryProvider {
    abstract get(
        tenantId: string,
        productCategoryId: string,
    ): Promise<{ name: string } | null>;
}