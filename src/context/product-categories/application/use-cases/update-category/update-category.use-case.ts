import { Injectable } from "@nestjs/common";

import {
    ProductCategoryRepository,
    ProductCategoryNotFoundException,
    ProductCategoryAlreadyActivatedException,
    ProductCategoryAlreadyDeactivatedException,
    ProductCategory,
} from "../../../domain";
import { CategoryName } from "@/context/product-categories/domain/exceptions/InvalidCategoryNameException";
import { TenantChecker } from "../../ports/tenant-checker";
import { TenantNotFoundException } from "@/context/products";
import { TenantIdRequiredForSearchException } from "@/context/product-categories/domain/exceptions/TenantId-Exception";

export interface UpdateCategoryApplicationParams {
    tenantId: string;
    name?: string;
    description?: string;
    estado?: boolean;
}

@Injectable()
export class UpdateCategoryUseCase {
    constructor(
        private readonly repository: ProductCategoryRepository,
        private readonly tenantChecker: TenantChecker,

    ) { }

    async execute(
        id: string,
        params: UpdateCategoryApplicationParams,
    ): Promise<ProductCategory> {


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


        const category = await this.repository.findById(id);

        if (!category) {
            throw new ProductCategoryNotFoundException(id);
        }

        category.update({
            name: params.name
                ? CategoryName.create(params.name)
                : CategoryName.create(category.toPrimitives().name),
            description: params.description ?? category.toPrimitives().description,
        });

        if (params.estado !== undefined) {
            const currentState = category.toPrimitives().isActive;

            if (params.estado === currentState) {
                if (currentState) {
                    throw new ProductCategoryAlreadyActivatedException();
                }
                throw new ProductCategoryAlreadyDeactivatedException();
            }

            if (params.estado) {
                category.activate();
            } else {
                category.deactivate();
            }
        }
        await this.repository.update(category);
        return category;

    }
}