import { SearchProductsApplicationParams } from "@/context/products/domain/types/product-application";
import {
    ProductRepository,
    TenantIdRequiredForSearchException,
} from "../../../domain";
import { ProductResponse } from "@/context/products/domain/types/product.response";
import { TenantNotFoundException } from "@/context/product-categories";
import { TenantChecker } from "../../ports/tenant-checker";

export class SearchProductsUseCase {
    constructor(
        private readonly repository: ProductRepository,
        private readonly tenantChecker: TenantChecker,

    ) { }

    public async execute(
        params: SearchProductsApplicationParams,
    ): Promise<ProductResponse[]> {

        const tenantExists = await this.tenantChecker.exists(
            params.tenantId,
        );

        if (!tenantExists) {
            throw new TenantNotFoundException(
                params.tenantId,
            );
        }
        if (!params.tenantId) {
            throw new TenantIdRequiredForSearchException();
        }
        return this.repository.search(params);
    }
}