import { Injectable } from "@nestjs/common";

import {
    ProductCategoryRepository,
    ProductCategoryNotFoundException,
} from "../../domain";

export interface UpdateCategoryApplicationParams {
    name?: string;
    description?: string;
    estado?: boolean;
}

@Injectable()
export class UpdateCategoryUseCase {
    constructor(
        private readonly repository: ProductCategoryRepository,
    ) { }

    async execute(
        id: string,
        params: UpdateCategoryApplicationParams,
    ): Promise<void> {

        const category = await this.repository.findById(id);

        if (!category) {
            throw new ProductCategoryNotFoundException(id);
        }

        if (params.name !== undefined) {
            category.name = params.name;
        }

        if (params.description !== undefined) {
            category.description = params.description;
        }

        if (params.estado !== undefined) {
            category.isActive = params.estado;
        }

        await this.repository.update(category);
    }
}