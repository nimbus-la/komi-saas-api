import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";

/**
 * Índices y unicidad viven en `public/db/01-init.sql`, que es la fuente de
 * verdad del esquema (igual que en users e inventory). En particular, el nombre
 * es único por tenant sin distinguir mayúsculas —regla que un @Unique de TypeORM
 * no puede expresar— vía uq_product_category_name_tenant_lower.
 */
@Entity("product_category")
export class ProductCategoryEntity {

    // El id lo genera el dominio (CategoryId.generate()), no la base de datos.
    @PrimaryColumn({ type: "uuid" })
    id!: string;

    @Column({ name: "tenant_id", type: "uuid" })
    tenantId!: string;

    @Column({ type: "varchar", length: 120 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "boolean", default: true, name: "is_active" })
    isActive!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
