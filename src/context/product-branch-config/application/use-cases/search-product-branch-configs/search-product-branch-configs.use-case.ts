import { ProductNotFoundException } from "@/context/products/domain/exceptions/product-exception";

import { ProductBranchConfigRepository } from "../../../domain/product-branch-config.repository";
import { ProductBranchConfigPrimitives } from "../../../domain/interfaces/product-branch-config.interface";
import { SearchProductBranchConfigsParams } from "../../../domain/interfaces/product-branch-config-application.interface";
import { ProductChecker } from "../../ports/product-checker";

/** Configuraciones del producto en todas las sucursales del negocio. */
export class SearchProductBranchConfigsUseCase {
    constructor(
        private readonly repository: ProductBranchConfigRepository,
        private readonly productChecker: ProductChecker,
    ) { }

    public async execute(
        params: SearchProductBranchConfigsParams,
    ): Promise<ProductBranchConfigPrimitives[]> {
        if (!await this.productChecker.existsInTenant(params.productId, params.tenantId)) {
            throw new ProductNotFoundException(params.productId);
        }

        const configs = await this.repository.findByProduct(params.tenantId, params.productId);

        return configs.map((config) => config.toPrimitives());
    }
}
