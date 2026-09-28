import { Paginated, Pagination } from "@/interfaces";

import {
    CategoryListItem,
    ProductCategoryRepository,
    SearchCategoriesFilters,
    TenantIdRequiredForSearchException,
    TenantNotFoundException,
} from "../../../domain";
import { TenantChecker } from "../../ports/tenant-checker";

export class SearchCategoriesUseCase {
    constructor(
        private readonly repository: ProductCategoryRepository,
        private readonly tenantChecker: TenantChecker,
    ) { }

    public async execute(
        filters: SearchCategoriesFilters,
        pagination: Pagination,
    ): Promise<Paginated<CategoryListItem>> {

        if (!filters.tenantId) {
            throw new TenantIdRequiredForSearchException();
        }

        const tenantExists = await this.tenantChecker.exists(filters.tenantId);

        if (!tenantExists) {
            throw new TenantNotFoundException(filters.tenantId);
        }

        const { rows, pageNumber, pageSize, total } =
            await this.repository.search(filters, pagination);

        return {
            rows: rows.map(({ category, productCount }) => ({
                ...category.toPrimitives(),
                productCount,
            })),
            pageNumber,
            pageSize,
            total,
        };
    }
}
