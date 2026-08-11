import { AggregateRoot } from "@/shared";

import { CategoryId } from "./value-object/category-id.value-object";
import { CategoryPrimitives } from "./types/product-primitives";
import { CategoryName } from "./exceptions/InvalidCategoryNameException";
import {
    ProductCategoryAlreadyActivatedException,
    ProductCategoryAlreadyDeactivatedException,
} from "./exceptions/product-category.exception";

export class ProductCategory extends AggregateRoot<CategoryId> {
    private tenantId: string;
    private name: CategoryName;
    private description: string | undefined;
    private isActive: boolean;
    private createdAt: Date;
    private updatedAt: Date;

    private constructor(
        id: CategoryId,
        tenantId: string,
        name: CategoryName,
        description: string | undefined,
        isActive: boolean,
        createdAt: Date,
        updatedAt: Date,
    ) {
        super(id);

        this.tenantId = tenantId;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public getTenantId(): string {
        return this.tenantId;
    }

    public getName(): CategoryName {
        return this.name;
    }

    public getDescription(): string | undefined {
        return this.description;
    }

    public getIsActive(): boolean {
        return this.isActive;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
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

    public activate(): void {
        if (this.isActive) {
            throw new ProductCategoryAlreadyActivatedException();
        }

        this.isActive = true;
        this.updatedAt = new Date();
    }

    public deactivate(): void {
        if (!this.isActive) {
            throw new ProductCategoryAlreadyDeactivatedException();
        }

        this.isActive = false;
        this.updatedAt = new Date();
    }

    public update(params: {
        name: CategoryName;
        description: string | undefined;
    }): void {
        this.name = params.name;
        this.description = params.description;
        this.updatedAt = new Date();
    }
}