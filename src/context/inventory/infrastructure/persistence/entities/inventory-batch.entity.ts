import { Column, Entity, Index, PrimaryColumn } from "typeorm";


@Entity({ name: 'inventory_batchs' })
@Index(['inventoryItemId'])
export class InventoryBatchEntity {

    @PrimaryColumn({ name: 'inventory_batch_id', type: 'uuid' })
    id!: string;


    @Column({ name: 'inventory_item_id', type: 'uuid' })
    inventoryItemId!: string;


    @Column({ name: 'branch_id', type: 'uuid' })
    branchId!: string;


    @Column({ name: 'quantity_received', type: 'numeric', precision: 14, scale: 3 })
    quantityReceived!: string;


    @Column({ name: 'quantity_remaining', type: 'numeric', precision: 14, scale: 3 })
    quantityRemaining!: string;


    @Column({ name: 'unit_cost_amount', type: 'numeric', precision: 12, scale: 2 })
    unitCostAmount!: string;


    @Column({ name: 'unit_cost_currency', type: 'varchar', length: 3 })
    unitCostCurrency!: string;


    @Column({ name: 'expiration_date', type: 'timestamptz', nullable: true })
    expirationDate!: Date | null;


    @Column({ name: 'received_at', type: 'timestamptz' })
    receivedAt!: Date;
};