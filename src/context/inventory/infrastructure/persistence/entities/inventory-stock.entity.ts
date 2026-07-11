import { Column, PrimaryColumn } from "typeorm";

export class InventoryStockEntity {

    @PrimaryColumn({ name: 'inventory_stock_id', type: 'uuid' })
    id!: string;


    @Column({ name: 'inventory_item_id', type: 'uuid' })
    inventoryItemId!: string;


    @Column({ name: 'branch_id', type: 'uuid' })
    branchId!: string;


    @Column({ name: 'min_stock', type: 'numeric', precision: 14, scale: 3 })
    minStock!: string;
};