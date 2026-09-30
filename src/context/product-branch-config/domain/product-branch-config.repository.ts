import { ProductBranchConfig } from "./product-branch-config.aggregate";
import { ProductBranchConfigId } from "./value-objects/product-config-id.value-object";

export abstract class ProductBranchConfigRepository {
    /** Crea o actualiza varias configuraciones en una sola transacción. */
    abstract saveMany(configs: ProductBranchConfig[]): Promise<void>;

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

    /** Quita la configuración para que la sucursal herede todo del producto. */
    abstract delete(
        id: ProductBranchConfigId,
        tenantId: string,
    ): Promise<void>;
}
