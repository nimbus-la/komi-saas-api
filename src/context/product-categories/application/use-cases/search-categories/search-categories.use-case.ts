import { Paginated } from "@/interfaces";

import {
    CategoryListItem,
    ProductCategoryRepository,
    SearchCategoriesFilters,
    TenantIdRequiredForSearchException,
    TenantNotFoundException,
} from "../../../domain";

import { TenantChecker } from "../../ports/tenant-checker";

export class SearchCategoriesUseCase {
    private readonly repository: ProductCategoryRepository;
    private readonly tenantChecker: TenantChecker;


    constructor(repository: ProductCategoryRepository, tenantChecker: TenantChecker) {
        this.repository = repository;
        this.tenantChecker = tenantChecker;
    }


    public async execute(params: SearchCategoriesFilters): Promise<Paginated<CategoryListItem>> {
        if (!params.tenantId) {
            throw new TenantIdRequiredForSearchException();
        }

        if (!(await this.tenantChecker.exists(params.tenantId))) {
            throw new TenantNotFoundException(params.tenantId);
        }

        return await this.repository.search(params);
    }
}
