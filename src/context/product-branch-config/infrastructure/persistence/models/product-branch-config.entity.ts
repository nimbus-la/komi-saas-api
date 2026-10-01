import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Precio y estado de un producto en una sucursal. Un valor en null hereda el
 * del producto. La unicidad y los CHECK viven en `public/db/tables/products.sql`.
 */
@Entity({ name: "product_branch_configs" })
export class ProductBranchConfigEntity {
  @PrimaryColumn({ name: "product_branch_config_id", type: "uuid" })
  id!: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column({ name: "product_id", type: "uuid" })
  productId!: string;

  @Column({ name: "branch_id", type: "uuid" })
  branchId!: string;

  @Column({ name: "price_amount", type: "numeric", precision: 12, scale: 2, nullable: true })
  priceAmount!: string | null;

  @Column({ name: "price_currency", type: "varchar", length: 3, nullable: true })
  priceCurrency!: string | null;

  @Column({ name: "is_available", type: "boolean", nullable: true })
  isAvailable!: boolean | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
