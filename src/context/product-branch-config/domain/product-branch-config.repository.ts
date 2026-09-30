import { ProductBranchConfig } from "./product-branch-config.aggregate";
import { ProductBranchConfigId } from "./value-objects/product-config-id.value-object";

export abstract class ProductBranchConfigRepository {
    /** Crea o actualiza varias configuraciones en una sola transacción. */
    abstract saveMany(configs: ProductBranchConfig[]): Promise<void>;

    /** Configuraciones del producto en todas sus sucursales. */
    abstract findByProduct(
        tenantId: string,
        productId: string,
    ): Promise<ProductBranchConfig[]>;

    /**
     * Borra varias configuraciones de una vez, solo si son del negocio. Las
     * sucursales afectadas vuelven a heredar todo del producto.
     */
    abstract deleteMany(
        ids: ProductBranchConfigId[],
        tenantId: string,
    ): Promise<void>;
}
