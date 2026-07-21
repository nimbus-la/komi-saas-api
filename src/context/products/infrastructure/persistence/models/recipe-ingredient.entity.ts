import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import { ProductEntity } from "./product.entity";
import { InventoryItemEntity } from "@/context/inventory";

@Entity({ name: "recipe_ingredients" })
export class RecipeIngredientEntity {
  @PrimaryColumn({
    name: "recipe_ingredient_id",
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
    precision: 14,
    scale: 3,
  })
  quantity!: string;

  @Column({
    name: "is_optional",
    type: "boolean",
    default: false,
  })
  isOptional!: boolean;

  @ManyToOne(
    () => ProductEntity,
    (product) => product.ingredients,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({
    name: "product_id",
  })
  product!: ProductEntity;

  @ManyToOne(
    () => InventoryItemEntity,
    {
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({
    name: "inventory_item_id",
  })
  inventoryItem!: InventoryItemEntity;
}