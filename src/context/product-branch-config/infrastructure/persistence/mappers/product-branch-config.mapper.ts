import { ProductBranchConfig } from "../../../domain/product-branch-config.aggregate";
import { ProductBranchConfigEntity } from "../models/product-branch-config.entity";

/**
 * Traduce entre el agregado ProductBranchConfig y su fila en
 * product_branch_configs, pasando por los primitivos del agregado.
 */
export class ProductBranchConfigMapper {

    public static toDomain(row: ProductBranchConfigEntity): ProductBranchConfig {
        return ProductBranchConfig.fromPrimitives({
            id: row.id,
            tenantId: row.tenantId,
            productId: row.productId,
            branchId: row.branchId,
            price: row.priceAmount,
            currency: row.priceCurrency,
            isAvailable: row.isAvailable,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }


    public static toPersistence(config: ProductBranchConfig): ProductBranchConfigEntity {
        const primitives = config.toPrimitives();

        return {
            id: primitives.id,
            tenantId: primitives.tenantId,
            productId: primitives.productId,
            branchId: primitives.branchId,
            priceAmount: primitives.price,
            priceCurrency: primitives.currency,
            isAvailable: primitives.isAvailable,
            createdAt: primitives.createdAt,
            updatedAt: primitives.updatedAt,
        };
    }
}
