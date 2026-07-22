import { Injectable } from "@nestjs/common";
import { ProductCategoryRepository } from "../../../domain";

@Injectable()
export class SearchCategoriesUseCase {
    constructor(
        private readonly repository: ProductCategoryRepository,
    ) { }

    async execute(params: {
        tenantId: string;
        text?: string;
        id?: string;
        estado?: boolean;
    }) {
        return this.repository.search(params);
    }
}