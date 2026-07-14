import {
    ProductRepository,
    ProductResponse,
    SearchProductsApplicationParams,
} from "../../domain";

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