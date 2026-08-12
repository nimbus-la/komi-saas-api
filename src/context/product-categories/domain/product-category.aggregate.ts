import { AggregateRoot } from "@/shared";

import { CategoryId } from "./value-object/category-id.value-object";
import { CategoryName } from "./value-object/category-name.value-object";
import { CategoryPrimitives } from "./types/category-primitives";
import {
    ProductCategoryAlreadyActivatedException,
    ProductCategoryAlreadyDeactivatedException,
} from "./exceptions/product-category.exception";

export class ProductCategory extends AggregateRoot<CategoryId> {
    private constructor(
        id: CategoryId,
        private readonly tenantId: string,
        private name: CategoryName,
        private description: string | undefined,
        private isActive: boolean,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {
        super(id);
    }

    public static create(params: {
        tenantId: string;
        name: CategoryName;
        description: string | undefined;
    }): ProductCategory {
        const now = new Date();

        return new ProductCategory(
            CategoryId.generate(),
            params.tenantId,
            params.name,
            params.description,
            true,
            now,
            now,
        );
    }

    public static fromPrimitives(
        primitives: CategoryPrimitives,
    ): ProductCategory {
        return new ProductCategory(
            CategoryId.create(primitives.id),
            primitives.tenantId,
            CategoryName.create(primitives.name),
            primitives.description,
            primitives.isActive,
            primitives.createdAt,
            primitives.updatedAt,
        );
    }

    public toPrimitives(): CategoryPrimitives {
        return {
            id: this.id.value,
            tenantId: this.tenantId,
            name: this.name.value,
            description: this.description,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    /** Aplica sólo los campos recibidos; los ausentes conservan su valor actual. */
    public update(params: {
        name?: CategoryName | undefined;
        description?: string | undefined;
    }): void {
        let changed = false;

        if (params.name !== undefined && params.name.value !== this.name.value) {
            this.name = params.name;
            changed = true;
        }

        if (
            params.description !== undefined &&
            params.description !== this.description
        ) {
            this.description = params.description;
            changed = true;
        }

        if (changed) {
            this.touch();
        }
    }

    public activate(): void {
        if (this.isActive) {
            throw new ProductCategoryAlreadyActivatedException();
        }

        this.isActive = true;
        this.touch();
    }

    public deactivate(): void {
        if (!this.isActive) {
            throw new ProductCategoryAlreadyDeactivatedException();
        }

        this.isActive = false;
        this.touch();
    }

    private touch(): void {
        this.updatedAt = new Date();
    }
}
