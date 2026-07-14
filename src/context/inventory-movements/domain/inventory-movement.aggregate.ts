import { AggregateRoot, Money, Quantity } from "@/shared";

import { InventoryMovementId } from "./value-objects/inventory-movement-id.value-object";
import { InventoryMovementType } from "./value-objects/inventory-movement-type.value-object";
import { MovementReasonRequiredException, NonPositiveMovementQuantityException } from "./exceptions/inventory-movement.exceptions";
import { InventoryMovementCreated, InventoryMovementPrimitives } from "./types/domain.types";


/**
 * Movimiento de inventario: el registro INMUTABLE de un cambio de cantidad
 * (entrada, salida, merma, ajuste) de un item en una sucursal.
 *
 * Es una bitácora append-only: se crea y nunca se edita ni se borra. Una
 * corrección no modifica el movimiento equivocado; se registra como un nuevo
 * movimiento de ajuste. Por eso no hay métodos de mutación.
 */
export class InventoryMovement extends AggregateRoot<InventoryMovementId> {
    private readonly tenantId: string;
    private readonly inventoryItemId: string;
    private readonly branchId: string;
    private readonly batchId: string | null;
    private readonly movementType: InventoryMovementType;
    private readonly quantity: Quantity;
    private readonly unitCost: Money | null;
    private readonly reason: string | null;
    // private readonly userId: string | null;
    private readonly occurredAt: Date;
    private readonly registeredAt: Date;


    private constructor(
        id: InventoryMovementId,
        tenantId: string,
        inventoryItemId: string,
        branchId: string,
        batchId: string | null,
        movementType: InventoryMovementType,
        quantity: Quantity,
        unitCost: Money | null,
        reason: string | null,
        occurredAt: Date,
        registeredAt: Date,
    ) {
        super(id);

        this.tenantId = tenantId;
        this.inventoryItemId = inventoryItemId;
        this.branchId = branchId;
        this.batchId = batchId;
        this.movementType = movementType;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.reason = reason;
        this.occurredAt = occurredAt;
        this.registeredAt = registeredAt;
    };



    /**
     * Registra un movimiento nuevo. Invariantes:
     *   - La cantidad debe ser mayor a cero (el signo lo da el TIPO, no el número).
     *   - Mermas y ajustes exigen motivo: son intervenciones manuales y la
     *     auditoría pierde sentido si no se sabe por qué se hicieron.
     */
    public static create(params: InventoryMovementCreated) {
        const { tenantId, inventoryItemId, branchId, batchId, movementType, quantity, unitCost, reason, occurredAt } = params;

        if (quantity.isZero()) {
            throw new NonPositiveMovementQuantityException();
        };

        const formmatedReason = reason?.trim() || null;

        if (movementType.requiresReason() && formmatedReason === null) {
            throw new MovementReasonRequiredException(movementType.value);
        };

        return new InventoryMovement(
            InventoryMovementId.generate(),
            tenantId,
            inventoryItemId,
            branchId,
            batchId,
            movementType,
            quantity,
            unitCost ?? null,
            formmatedReason,
            occurredAt ?? new Date(),
            new Date(),
        )
    };


    public toPrimitives(): InventoryMovementPrimitives {
        return {
            id: this.id.value,
            tenantId: this.tenantId,
            inventoryItemId: this.inventoryItemId,
            branchId: this.branchId,
            batchId: this.batchId,
            movementType: this.movementType.value,
            quantity: this.quantity.getValue(),
            unitCostAmount: this.unitCost ? this.unitCost.getAmount() : null,
            unitCostCurrency: this.unitCost ? this.unitCost.currency : null,
            reason: this.reason,
            // userId: this.userId,
            occurredAt: this.occurredAt,
            registeredAt: this.registeredAt,
        };
    };



    public static fromPrimitives(p: InventoryMovementPrimitives): InventoryMovement {
        return new InventoryMovement(
            InventoryMovementId.create(p.id),
            p.tenantId,
            p.inventoryItemId,
            p.branchId,
            p.batchId,
            InventoryMovementType.created(p.movementType),
            Quantity.of(p.quantity),
            p.unitCostAmount && p.unitCostCurrency ? Money.of(p.unitCostAmount, p.unitCostCurrency) : null,
            p.reason,
            p.occurredAt,
            p.registeredAt,
        );
    };
};