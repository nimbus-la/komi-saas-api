import { EntityStatus, VALIDATION_DEFAULTS } from "@/shared";

import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";


@Entity("product_category")
export class ProductCategoryModel {
    @PrimaryColumn({ name: "category_id", type: "uuid" })
    categoryId!: string;

    @Column({ name: "tenant_id", type: "uuid" })
    tenantId!: string;

    @Column({
        name: "name",
        type: "varchar",
        length: VALIDATION_DEFAULTS.PRODUCTS_CATEGORY.MAX_LENGTH_NAME
    })
    name!: string;

    @Column({
        name: "description",
        type: "varchar",
        length: VALIDATION_DEFAULTS.PRODUCTS_CATEGORY.MAX_LENGTH_DESCRIPTION,
        nullable: true
    })
    description!: string | null;

    @Column({
        name: "status",
        type: "varchar",
        length: VALIDATION_DEFAULTS.STATUS_MAX_LENGTH,
        default: EntityStatus.Active
    })
    status!: EntityStatus;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
