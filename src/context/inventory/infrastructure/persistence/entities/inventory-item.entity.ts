import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity({ name: 'inventory_items' })
export class InventoryItemEntity {
    @PrimaryColumn({ name: 'inventory_item_id', type: 'uuid' })
    id!: string;


    @Column({ name: 'sku', type: 'varchar', length: 20, unique: true })
    sku!: string;


    @Column({ name: 'name', type: 'varchar', length: 120 })
    name!: string;


    @Column({ name: 'unit_of_measure', type: 'varchar', length: 20 })
    unitOfMeasure!: string;


    @Column({ name: 'cost_amount', type: 'numeric', precision: 12, scale: 2 })
    costAmount!: string;


    @Column({ name: 'cost_currency', type: 'varchar', length: 3 })
    costCurrency!: string;


    @Column({ name: 'is_perishable', type: 'boolean' })
    isPerishable!: boolean;


    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive!: boolean;


    @Column({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    
    @Column({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
};