import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { InventoryItemEntity } from "./inventory-item.entity";


@Entity({ name: 'inventory_batchs' })
@Index(['inventoryItemId'])
export class InventoryBatchEntity {

    @PrimaryColumn({ name: 'inventory_batch_id', type: 'uuid' })
    id!: string;


    @Column({ name: 'inventory_item_id', type: 'uuid' })
    inventoryItemId!: string;


    // Relación SOLO de infraestructura: crea la FK hacia inventory_items.
    // No se navega desde el dominio; existe para integridad referencial.
    // onDelete RESTRICT: no se puede borrar un item que todavía tiene lotes.
    @ManyToOne(() => InventoryItemEntity, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'inventory_item_id' })
    item?: InventoryItemEntity;


    /* @Column({ name: 'branch_id', type: 'uuid' })
    branchId!: string; */
    // LISTO: descomentar (y migrar) cuando exista el contexto de branches.


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