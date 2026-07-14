import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity({ name: 'inventory_movements' })
export class InventoryMovementModel {
    @PrimaryColumn({ name: 'inventory_movement_id', type: 'uuid' })
    id!: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId!: string;

    @Column({ name: 'inventory_item_id', type: 'uuid' })
    inventoryItemId!: string;

    @Column({ name: 'branch_id', type: 'uuid' })
    branchId!: string;

    @Column({ name: 'batch_id', type: 'uuid', nullable: true })
    batchId!: string | null;

    @Column({ name: 'movement_type', type: 'varchar', length: 20 })
    movementType!: string;

    @Column({ name: 'quantity', type: 'numeric', precision: 14, scale: 3 })
    quantity!: string;

    @Column({ name: 'unit_cost_amount', type: 'numeric', precision: 12, scale: 2, nullable: true })
    unitCostAmount!: string | null;

    @Column({ name: 'unit_cost_currency', type: 'varchar', length: 3, nullable: true })
    unitCostCurrency!: string | null;

    @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
    reason!: string | null;

    // @Column({ name: 'user_id', type: 'uuid', nullable: true })
    // userId!: string | null;

    @Column({ name: 'occurred_at', type: 'timestamptz' })
    occurredAt!: Date;

    @Column({ name: 'registered_at', type: 'timestamptz' })
    registeredAt!: Date;
};