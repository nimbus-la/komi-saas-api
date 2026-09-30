import { ProductBranchConfig } from "./product-branch-config.aggregate";
import { ProductBranchConfigId } from "./value-objects/product-config-id.value-object";

export abstract class ProductBranchConfigRepository {
    /** Crea o actualiza la configuración. */
    abstract save(config: ProductBranchConfig): Promise<void>;

    abstract findByProductAndBranch(
        tenantId: string,
        productId: string,
        branchId: string,
    ): Promise<ProductBranchConfig | null>;

    /** Configuraciones del producto en todas sus sucursales. */
    abstract findByProduct(
        tenantId: string,
        productId: string,
    ): Promise<ProductBranchConfig[]>;

    /** Se usa cuando la configuración queda vacía (isEmpty). */
    abstract delete(
        id: ProductBranchConfigId,
        tenantId: string,
    ): Promise<void>;
}
