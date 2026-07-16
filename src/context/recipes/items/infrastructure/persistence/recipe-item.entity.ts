import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    UpdateDateColumn,
} from "typeorm";

import { ProductEntity } from "../../../../products/infrastructure/persistence/models/product.entity";
import { InventoryItemEntity } from "@/context/inventory";

@Entity({ name: "recipe_item" })
export class RecipeItemEntity {
    @PrimaryColumn({
        name: "recipe_item_id",
        type: "uuid",
    })
    id!: string;

    @Column({
        name: "product_id",
        type: "uuid",
    })
    productId!: string;

    @Column({
        name: "inventory_item_id",
        type: "uuid",
    })
    inventoryItemId!: string;

    @Column({
        name: "quantity",
        type: "numeric",
        precision: 12,
        scale: 2,
    })
    quantity!: string;

    @Column({
        name: "unit",
        type: "varchar",
        length: 20,
    })
    unit!: string;

    @Column({
        name: "line_cost",
        type: "numeric",
        precision: 12,
        scale: 2,
    })
    lineCost!: string;

    @Column({
        name: "is_optional",
        type: "boolean",
        default: false,
    })
    isOptional!: boolean;

    @UpdateDateColumn({
        name: "updated_at",
    })
    updatedAt!: Date;

    @ManyToOne(() => ProductEntity)
    @JoinColumn({ name: "product_id" })
    product!: ProductEntity;

    @ManyToOne(() => InventoryItemEntity)
    @JoinColumn({ name: "inventory_item_id" })
    inventoryItem!: InventoryItemEntity;
}