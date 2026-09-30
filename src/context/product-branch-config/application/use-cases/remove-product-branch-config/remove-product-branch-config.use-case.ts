import { ProductBranchConfigNotFoundException } from "../../../domain/exceptions/product-branch-config.exception";
import { ProductBranchConfigRepository } from "../../../domain/product-branch-config.repository";

export interface RemoveProductBranchConfigParams {
    tenantId: string;
    productId: string;
    branchId: string;
}

/**
 * Quita la configuración para que la sucursal vuelva a heredar todo del
 * producto. La búsqueda ya filtra por negocio, así que no hace falta validar
 * el producto ni la sucursal por aparte.
 */
export class RemoveProductBranchConfigUseCase {
    constructor(
        private readonly repository: ProductBranchConfigRepository,
    ) { }

    public async execute(params: RemoveProductBranchConfigParams): Promise<void> {
        const { tenantId, productId, branchId } = params;

        const config = await this.repository.findByProductAndBranch(tenantId, productId, branchId);

        if (!config) {
            throw new ProductBranchConfigNotFoundException(productId, branchId);
        }

        await this.repository.delete(config.id, tenantId);
    }
}
