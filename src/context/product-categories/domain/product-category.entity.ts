import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { ProductEntity } from "../../products/products/infrastructure/persistence/product.entity";

@Entity("product_category")
export class ProductCategoryEntity {

    @PrimaryGeneratedColumn("uuid")
    id!: string;

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

    // 🔥 RELACIÓN INVERSA
    @OneToMany(() => ProductEntity, (product) => product.category)
    products!: ProductEntity[];
}