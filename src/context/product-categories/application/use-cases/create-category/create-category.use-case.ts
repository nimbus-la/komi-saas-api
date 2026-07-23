import {
    ProductCategory,
    ProductCategoryAlreadyExistsException,
    ProductCategoryRepository,
} from "../../../domain";
import { CategoryName } from "@/context/product-categories/domain/exceptions/InvalidCategoryNameException";

export interface CreateCategoryApplicationParams {
    tenantId: string;
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

        const exists = await this.repository.existsByName(params.name, params.tenantId);

        if (exists) {
            throw new ProductCategoryAlreadyExistsException(
                params.name,
            );
        }
        const category = ProductCategory.create({
            tenantId: params.tenantId,
            name: CategoryName.create(params.name),
            description: params.description,
        });

        await this.repository.save(category);
    }
}