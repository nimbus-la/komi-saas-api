import {
    ProductCategory,
    ProductCategoryAlreadyExistsException,
    ProductCategoryRepository,
    TenantNotFoundException,
} from "../../../domain";
import { CategoryName } from "@/context/product-categories/domain/exceptions/InvalidCategoryNameException";
import { TenantChecker } from "../../ports/tenant-checker";

export interface CreateCategoryApplicationParams {
    tenantId: string;
    name: string;
    description?: string | undefined;

}

export class CreateCategoryUseCase {
    constructor(
        private readonly repository: ProductCategoryRepository,
        private readonly tenantChecker: TenantChecker,

    ) { }

    async execute(
        params: CreateCategoryApplicationParams,
    ): Promise<ProductCategory> {

        const tenantExists =
            await this.tenantChecker.exists(
                params.tenantId,
            );


        if (!tenantExists) {
            throw new TenantNotFoundException(
                params.tenantId,
            );
        }

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

        return category;
    }
}