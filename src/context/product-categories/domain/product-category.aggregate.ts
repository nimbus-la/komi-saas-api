import { AggregateRoot } from "@/shared";

import { CategoryId } from "./value-object/category-id.value-object";
import { CategoryPrimitives } from "./types/product-primitives";
import { CategoryName } from "./exceptions/InvalidCategoryNameException";

export class ProductCategory extends AggregateRoot<CategoryId> {
    private tenantId: string;
    private name: CategoryName;
    private description: string | undefined;
    private isActive: boolean;

    private constructor(
        id: CategoryId,
        tenantId: string,
        name: CategoryName,
        description: string | undefined,
        isActive: boolean,
    ) {
        super(id);

        this.tenantId = tenantId;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
    }

    public static create(params: {
        tenantId: string;
        name: CategoryName;
        description: string | undefined;
    }): ProductCategory {
        return new ProductCategory(
            CategoryId.generate(),
            params.tenantId,
            params.name,
            params.description,
            true,
        );
    }

    public toPrimitives(): CategoryPrimitives {
        return {
            id: this.id.value,
            tenantId: this.tenantId,
            name: this.name.value,
            description: this.description,
            isActive: this.isActive,
        };
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
        );
    }

    public activate(): void {
        if (this.isActive) {
            throw new Error("La categoría ya se encuentra activada.");
        }

        this.isActive = true;
    }

    public deactivate(): void {
        if (!this.isActive) {
            throw new Error("La categoría ya se encuentra desactivada.");
        }

        this.isActive = false;
    }

    public update(params: {
        name: CategoryName;
        description: string | undefined;
    }): void {
        this.name = params.name;
        this.description = params.description;
    }
}