import { AggregateRoot, EntityStatus, Status } from "@/shared";

import { CategoryPrimitives } from "./interfaces/category.primitives";
import { CategoryId } from "./value-object/category-id.value-object";
import { CategoryName } from "./value-object/category-name.value-object";
import { ProductCategoryAlreadyActivatedException, ProductCategoryAlreadyDeactivatedException, ProductCategoryDeletedException } from "./exceptions/product-category.exception";


export class ProductCategory extends AggregateRoot<CategoryId> {
    private readonly tenantId: string;
    private name: CategoryName;
    private description: string | undefined;
    private status: Status;
    private readonly createdAt: Date;
    private updatedAt: Date;


    private constructor(
        id: CategoryId,
        tenantId: string,
        name: CategoryName,
        description: string | undefined,
        status: Status,
        createdAt: Date,
        updatedAt: Date,
    ) {
        super(id);

        this.tenantId = tenantId;
        this.name = name;
        this.description = description;
        this.status = status;
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
            Status.active(),
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
            status: this.status.value,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }


    public static fromPrimitives(primitives: CategoryPrimitives): ProductCategory {
        return new ProductCategory(
            CategoryId.create(primitives.id),
            primitives.tenantId,
            CategoryName.create(primitives.name),
            primitives.description,
            Status.create(primitives.status),
            primitives.createdAt,
            primitives.updatedAt,
        );
    }


    /** Aplica sólo los campos recibidos; los ausentes conservan su valor actual. */
    public update(params: {
        name?: CategoryName | undefined;
        description?: string | undefined;
    }): void {
        this.ensureNotDelete();

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
        this.ensureNotDelete();

        if (this.status.is(EntityStatus.Active)) {
            throw new ProductCategoryAlreadyActivatedException();
        }

        this.status = this.status.transitionTo(EntityStatus.Active);
        this.touch();
    }


    public desactivate(): void {
        this.ensureNotDelete();

        if (this.status.is(EntityStatus.Inactive)) {
            throw new ProductCategoryAlreadyDeactivatedException();
        }

        this.status = this.status.transitionTo(EntityStatus.Inactive);
        this.touch();
    }


    /**
     * Cambia entre ACTIVE e INACTIVE con el valor que llega de la actualización.
     * Eliminar no pasa por aquí: tiene su propio método y su propio endpoint.
     */
    public changeStatus(next: EntityStatus): void {
        if (next === EntityStatus.Active) {
            this.activate();
            return;
        }

        if (next === EntityStatus.Inactive) {
            this.desactivate();
            return;
        }

        this.status.transitionTo(next);
    }


    public delete(): void {
        this.ensureNotDelete();

        this.status = this.status.transitionTo(EntityStatus.Deleted);
        this.touch();
    }


    public getName(): string {
        return this.name.value;
    }


    public getStatus(): EntityStatus {
        return this.status.value;
    }


    private ensureNotDelete(): void {
        if (this.status.isDeleted()) {
            throw new ProductCategoryDeletedException(this.id.value);
        };
    }


    private touch(): void {
        this.updatedAt = new Date();
    }
}
