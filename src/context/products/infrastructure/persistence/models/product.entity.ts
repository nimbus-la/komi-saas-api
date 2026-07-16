import { ProductCategoryEntity } from "@/context/product-categories";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "product" })
export class ProductEntity {
  @PrimaryColumn({ name: "product_id", type: "uuid" })
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ name: "product_category_id", type: "uuid" })
  productCategoryId!: string;

  @Column({ name: "product_name", type: "varchar", length: 120 })
  name!: string;

  @Column({ name: "product_description", type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "product_base_price", type: "numeric", precision: 12, scale: 2 })
  basePrice!: string;

  @Column({ name: "profit_margin", type: "numeric", precision: 5, scale: 2 })
  profitMargin!: string;

  @Column({ name: "product_status", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "product_img_url", type: "text", nullable: true })
  imageUrl!: string | null;

  @Column({ name: "product_sku_seq", type: "varchar", length: 50, unique: true })
  sku!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @ManyToOne(() => ProductCategoryEntity, (category) => category.products)
  @JoinColumn({ name: "product_category_id" })
  category!: ProductCategoryEntity;
}