import { Injectable } from "@nestjs/common";
import {
    ProductCategoryRepository,
    TenantNotFoundException,
} from "../../../domain";
import { TenantChecker } from "../../ports/tenant-checker";
import { TenantIdRequiredForSearchException } from "@/context/product-categories/domain/exceptions/TenantId_Exception";

@Injectable()
export class SearchCategoriesUseCase {
    constructor(
        private readonly repository: ProductCategoryRepository,
        private readonly tenantChecker: TenantChecker,

    ) { }

    async execute(params: {
        tenantId: string;
        text?: string;
        id?: string;
        isActive?: boolean;
        createdAt?: string;
        updatedAt?: string;
        page?: number;
        limit?: number;
    }) {
        if (!params.tenantId) {
            throw new TenantIdRequiredForSearchException();
        }

        const tenantExists = await this.tenantChecker.exists(
            params.tenantId,
        );

        if (!tenantExists) {
            throw new TenantNotFoundException(
                params.tenantId,
            );
        }

        const page = params.page ?? 1;
        const limit = params.limit ?? 10;

        const result = await this.repository.search({
            ...params,
            page,
            limit,
        });

        return {
            data: result.data.map((category) =>
                category.toPrimitives(),
            ),
            meta: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }
}
