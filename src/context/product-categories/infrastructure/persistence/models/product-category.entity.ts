import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("product_category")
export class ProductCategoryEntity {

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "tenant_id", type: "uuid" })
    tenantId!: string;

    @Column({ type: "varchar", length: 150 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "boolean", default: true })
    estado!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}