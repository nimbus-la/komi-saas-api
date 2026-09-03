import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";

/**
 * El esquema vive en `public/db/04-menus.sql`, que es la fuente de verdad: allí
 * están la clave foránea contra la propia tabla y los CHECK del tipo y de la
 * jerarquía, que un decorador de TypeORM no sabe expresar.
 */
@Entity("menu")
export class MenuEntity {

    @PrimaryColumn({ name: "menu_id", type: "uuid" })
    id!: string;

    /** Null sólo en los primarios. Apunta a otra fila de esta misma tabla. */
    @Index()
    @Column({ name: "parent_id", type: "uuid", nullable: true })
    parentId!: string | null;

    /**
     * Identificador estable para el front. Único en toda la tabla; la unicidad
     * la impone `uq_menu_code` en el SQL.
     */
    @Column({ name: "menu_code", type: "varchar", length: 60, unique: true })
    code!: string;

    @Column({ name: "menu_type", type: "varchar", length: 12 })
    type!: string;

    @Column({ name: "menu_title", type: "varchar", length: 120 })
    title!: string;

    @Column({ name: "menu_subtitle", type: "varchar", length: 225, nullable: true })
    subtitle!: string | null;

    @Column({ name: "menu_icon", type: "varchar", length: 80, nullable: true })
    icon!: string | null;

    @Column({ name: "menu_url", type: "varchar", length: 225, nullable: true })
    url!: string | null;

    @Column({ name: "menu_order", type: "int", default: 0 })
    order!: number;

    @Column({ name: "menu_is_active", type: "boolean", default: true })
    isActive!: boolean;

    @Column({ name: "menu_is_new", type: "boolean", default: false })
    isNew!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
