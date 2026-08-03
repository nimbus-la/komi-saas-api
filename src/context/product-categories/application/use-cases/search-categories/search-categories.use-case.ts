import { Injectable } from "@nestjs/common";
import { ProductCategoryRepository, TenantNotFoundException } from "../../../domain";
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
        estado?: boolean;
    }) {
        const categories = await this.repository.search(params);
        const tenantExists = await this.tenantChecker.exists(
            params.tenantId,
        );

        if (!tenantExists) {
            throw new TenantNotFoundException(
                params.tenantId,
            );
        }
        if (!params.tenantId) {
            throw new TenantIdRequiredForSearchException();
        }
        return categories.map((category) => category.toPrimitives());
    }
}