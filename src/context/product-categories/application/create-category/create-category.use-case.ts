import { randomUUID } from "crypto";

import {
    ProductCategory,
    ProductCategoryRepository,
} from "../../domain";

export interface CreateCategoryApplicationParams {
    name: string;
    description?: string | undefined;
    estado?: boolean | undefined;

}

export class CreateCategoryUseCase {
    constructor(
        private readonly repository: ProductCategoryRepository,
    ) { }

    async execute(
        params: CreateCategoryApplicationParams,
    ): Promise<void> {

        const exists = await this.repository.existsByName(params.name);

        if (exists) {
            throw new Error("La categoría ya existe");
        }

        const category = ProductCategory.create({
            id: randomUUID(),
            name: params.name,
            description: params.description,
            estado: params.estado ?? true,
        });

        await this.repository.save(category);
    }
}