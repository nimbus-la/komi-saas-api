import { Injectable } from "@nestjs/common";
import { ProductCategoryRepository } from "../../../domain";

@Injectable()
export class SearchCategoriesUseCase {
    constructor(
        private readonly repository: ProductCategoryRepository,
    ) { }

    async execute(params: {
        tenantId?: string;
        text?: string;
        id?: string;
        estado?: boolean;
    }) {
        const categories = await this.repository.search(params);

        return categories.map((category) => category.toPrimitives());
    }
}