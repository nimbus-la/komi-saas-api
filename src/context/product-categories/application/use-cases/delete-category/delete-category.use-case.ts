import { TenantNotFoundException } from "@/shared";

import { CategoryHasProductsException, ProductCategoryNotFoundException, ProductCategoryRepository, TenantIdRequiredForSearchException } from "../../../domain";

import { DeleteCategoryApplicationParams } from "../../interfaces/category.params";
import { TenantChecker } from "../../ports/tenant-checker";


export class DeleteCategoryUseCase {
    private readonly repository: ProductCategoryRepository;
    private readonly tenantChecker: TenantChecker;


    constructor(repository: ProductCategoryRepository, tenantChecker: TenantChecker) {
        this.repository = repository;
        this.tenantChecker = tenantChecker;
    }


    public async execute(params: DeleteCategoryApplicationParams): Promise<void> {
        if (!params.tenantId) {
            throw new TenantIdRequiredForSearchException();
        }

        if (!(await this.tenantChecker.exists(params.tenantId))) {
            throw new TenantNotFoundException(params.tenantId);
        }

        // Si ya fue eliminada o es de otro negocio, no la encuentra
        const category = await this.repository.findById(
            params.categoryId,
            params.tenantId
        );

        if (!category) {
            throw new ProductCategoryNotFoundException(params.categoryId);
        }

        // Los productos eliminados no cuentan, solo los activos e inactivo
        const productCount = await this.repository.countProducts(
            params.categoryId,
            params.tenantId
        );

        // Si todavía tiene productos no se elimina, el usuario los mueve primero
        if (productCount > 0) {
            throw new CategoryHasProductsException(category.getName(), productCount);
        }

        // Queda marcada como eliminada y la fila se conserva
        category.delete();
        await this.repository.update(category);
    }
}