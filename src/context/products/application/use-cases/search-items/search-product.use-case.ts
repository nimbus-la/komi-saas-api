import { SearchProductsApplicationParams } from "@/context/products/domain/types/product-application";
import {
    ProductRepository,
} from "../../../domain";
import { ProductResponse } from "@/context/products/domain/types/product.response";

export class SearchProductsUseCase {
    constructor(
        private readonly repository: ProductRepository,
    ) { }

    public async execute(
        params: SearchProductsApplicationParams,
    ): Promise<ProductResponse[]> {

        return this.repository.search(params);
    }
}