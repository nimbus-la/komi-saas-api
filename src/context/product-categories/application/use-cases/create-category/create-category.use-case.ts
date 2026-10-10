import { TenantNotFoundException } from "@/shared";

import {
    CategoryName,
    ProductCategory,
    ProductCategoryAlreadyExistsException,
    ProductCategoryRepository,
} from "../../../domain";

import { CreateCategoryApplicationParams } from "../../interfaces/category.params"
import { TenantChecker } from "../../ports/tenant-checker";


export class CreateCategoryUseCase {
    private readonly repository: ProductCategoryRepository;
    private readonly tenantChecker: TenantChecker;


    constructor(repository: ProductCategoryRepository, tenantChecker: TenantChecker) {
        this.repository = repository;
        this.tenantChecker = tenantChecker;
    }


    public async execute(params: CreateCategoryApplicationParams): Promise<void> {
        if (!(await this.tenantChecker.exists(params.tenantId))) {
            throw new TenantNotFoundException(params.tenantId);
        }

        // CategoryName limpia los espacios, así "  Bebidas " se compara como "Bebidas"
        const category = ProductCategory.create({
            tenantId: params.tenantId,
            name: CategoryName.create(params.name),
            description: params.description
        });

        // El id es nuevo y no está en la tabla, así que solo compara contra las demás
        if (await this.repository.isNameTake(category)) {
            throw new ProductCategoryAlreadyExistsException(category.getName());
        }

        await this.repository.save(category);
    }
}
