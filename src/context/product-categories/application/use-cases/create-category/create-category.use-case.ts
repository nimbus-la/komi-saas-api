import {
    CategoryName,
    CategoryPrimitives,
    CreateCategoryApplicationParams,
    ProductCategory,
    ProductCategoryAlreadyExistsException,
    ProductCategoryRepository,
    TenantNotFoundException,
} from "../../../domain";
import { TenantChecker } from "../../ports/tenant-checker";

export class CreateCategoryUseCase {
    constructor(
        private readonly repository: ProductCategoryRepository,
        private readonly tenantChecker: TenantChecker,
    ) { }

    public async execute(
        params: CreateCategoryApplicationParams,
    ): Promise<CategoryPrimitives> {

        const tenantExists = await this.tenantChecker.exists(params.tenantId);

        if (!tenantExists) {
            throw new TenantNotFoundException(params.tenantId);
        }

        // Se normaliza antes de consultar: si no, "  Bebidas " esquiva el chequeo
        // de duplicados y termina guardándose como "Bebidas".
        const name = CategoryName.create(params.name);

        const exists = await this.repository.existsByName(
            name.value,
            params.tenantId,
        );

        if (exists) {
            throw new ProductCategoryAlreadyExistsException(name.value);
        }

        const category = ProductCategory.create({
            tenantId: params.tenantId,
            name,
            description: params.description,
        });

        await this.repository.save(category);

        return category.toPrimitives();
    }
}
