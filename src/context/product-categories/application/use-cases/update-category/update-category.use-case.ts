import { Injectable } from "@nestjs/common";

import {
    ProductCategoryRepository,
    ProductCategoryNotFoundException,
} from "../../../domain";
import { CategoryName } from "@/context/product-categories/domain/exceptions/InvalidCategoryNameException";

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

        category.update({
            name: params.name
                ? CategoryName.create(params.name)
                : CategoryName.create(category.toPrimitives().name),
            description: params.description ?? category.toPrimitives().description,
        });

        if (params.estado !== undefined) {
            const currentState = category.toPrimitives().isActive;

            if (params.estado !== currentState) {
                if (params.estado) {
                    category.activate();
                } else {
                    category.deactivate();
                }
            }
        }

        await this.repository.update(category);
    }
}