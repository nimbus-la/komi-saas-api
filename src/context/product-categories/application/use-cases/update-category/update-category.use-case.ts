import { TenantNotFoundException } from "@/shared";

import {
    CategoryName,
    ProductCategoryAlreadyExistsException,
    ProductCategoryNotFoundException,
    ProductCategoryRepository,
    TenantIdRequiredForSearchException,
} from "../../../domain";

import { UpdateCategoryApplicationParams } from "../../interfaces/category.params";
import { TenantChecker } from "../../ports/tenant-checker";


export class UpdateCategoryUseCase {
    private readonly repository: ProductCategoryRepository;
    private readonly tenantChecker: TenantChecker;


    constructor(repository: ProductCategoryRepository, tenantChecker: TenantChecker) {
        this.repository = repository;
        this.tenantChecker = tenantChecker;
    }


    public async execute(params: UpdateCategoryApplicationParams): Promise<void> {
        if (!params.tenantId) {
            throw new TenantIdRequiredForSearchException();
        }

        if (!(await this.tenantChecker.exists(params.tenantId))) {
            throw new TenantNotFoundException(params.tenantId);
        }

        const category = await this.repository.findById(
            params.categoryId,
            params.tenantId
        );

        if (!category) {
            throw new ProductCategoryNotFoundException(params.categoryId);
        }

        category.update({
            name: params.name !== undefined ? CategoryName.create(params.name) : undefined,
            description: params.description
        });

        // Se valida despues de aplicar el cambio en el dominio para comparar con el nombre nuevo.
        if (
            params.name !== undefined &&
            await this.repository.isNameTake(category)
        ) {
            throw new ProductCategoryAlreadyExistsException(category.getName());
        }

        if (params.status !== undefined) {
            category.changeStatus(params.status);
        }

        await this.repository.update(category);
    }
}
