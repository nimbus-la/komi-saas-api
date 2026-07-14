import { Entity, Money, Quantity } from "@/shared";

import { InventoryBatchPrimitives } from "../../types/domain.types";
import { EmptyBatchException, InsufficientBatchQuantityException } from "../../exceptions/inventory-batch.exceptions";
import { InventoryBatchExpirationDate } from "./value-objects/inventory-batch-expiration.value-object";
import { InventoryBatchId } from "./value-objects/inventory-batch-id.value-object";


/**
 * Lote de inventario. Es una ENTIDAD hija del agregado InventoryItem (no un
 * aggregate root): existe solo dentro de un item y no se accede ni se persiste
 * por su cuenta; el item es su único punto de entrada.
 *
 * Representa una recepción concreta de mercancía: una cantidad recibida a un
 * costo unitario dado, con su fecha de vencimiento (si el item es perecedero) y
 * su fecha de recepción. La cantidad restante (quantityRemaining) baja a medida
 * que se consume; el resto de sus datos son inmutables una vez creado el lote.
 */
export class InventoryBatch extends Entity<InventoryBatchId> {
    private readonly branchId: string;
    private readonly quantityReceived: Quantity;
    private quantityRemaining: Quantity;
    private readonly unitCost: Money;
    private readonly expirationDate: InventoryBatchExpirationDate | null;
    private readonly receivedAt: Date;



    /**
     * Constructor privado: solo se invoca desde create() (lote nuevo) o
     * fromPrimitives() (rehidratación desde la base). Privado para que nadie arme un
     * lote saltándose sus reglas de creación.
     */
    private constructor(
        id: InventoryBatchId,
        branchId: string,
        quantityReceived: Quantity,
        quantityRemaining: Quantity,
        unitCost: Money,
        expirationDate: InventoryBatchExpirationDate | null,
        receivedAt: Date,
    ) {
        super(id);

        this.branchId = branchId;
        this.quantityReceived = quantityReceived;
        this.quantityRemaining = quantityRemaining;
        this.unitCost = unitCost;
        this.expirationDate = expirationDate;
        this.receivedAt = receivedAt;
    };



    /**
     * Fábrica de un lote NUEVO (una recepción de mercancía).
     * Regla: no se puede recibir un lote con cantidad cero -> EmptyBatchException.
     * Al crear, la cantidad restante arranca IGUAL a la recibida (aún no se ha
     * consumido nada). Si no se indica receivedAt, se asume "ahora".
     * No registra eventos: las entidades no emiten eventos de dominio; eso es
     * responsabilidad del root (InventoryItem).
     */
    public static create(params: {
        branchId: string;
        quantityReceived: Quantity;
        unitCost: Money;
        expirationDate: InventoryBatchExpirationDate | null;
        receivedAt?: Date;
    }): InventoryBatch {
        if (params.quantityReceived.isZero()) {
            throw new EmptyBatchException();
        };

        return new InventoryBatch(
            InventoryBatchId.generate(),
            params.branchId,
            params.quantityReceived,
            params.quantityReceived,
            params.unitCost,
            params.expirationDate,
            params.receivedAt ?? new Date(),
        );
    };



    /**
     * Descuenta 'quantity' de ESTE lote en particular.
     * Regla: no se puede consumir más de lo que le queda -> InsufficientBatchQuantityException
     * (protege la invariante del lote: la cantidad restante nunca queda negativa).
     * NOTA: aquí NO se decide de qué lote sacar; la selección FEFO/FIFO entre los
     * lotes del item la hace el root. Este método solo aplica el descuento una vez
     * que el root ya eligió este lote.
     */
    public consume(quantity: Quantity): void {
        if (quantity.isGreaterThan(this.quantityRemaining)) {
            throw new InsufficientBatchQuantityException();
        };

        this.quantityRemaining = this.quantityRemaining.subtract(quantity);
    };



    /**
     * ¿El lote está vencido a la fecha 'date'?
     * Si no tiene fecha de vencimiento (no perecedero), nunca vence -> false.
     * Si la tiene, está vencido cuando su vencimiento es anterior a 'date'.
     */
    public isExpired(date: Date): boolean {
        return this.expirationDate ? this.expirationDate.isBefore(date) : false;
    };



    /** ¿El lote está agotado? (su cantidad restante llegó a cero). */
    public isDepleted(): boolean {
        return this.quantityRemaining.isZero();
    };



    /**
     * ¿El lote está ACTIVO a la fecha 'date'? Un lote sirve solo si le queda
     * cantidad Y no está vencido. Es el filtro que usa el root para saber qué lotes
     * cuentan para el stock, el costo y el consumo (los agotados o vencidos se
     * ignoran).
     */
    public isActive(date: Date): boolean {
        return !this.isDepleted() && !this.isExpired(date);
    };



    /** Cantidad que aún queda en el lote. Getter para que el root sume el stock. */
    public getRemaining(): Quantity {
        return this.quantityRemaining;
    };



    /**
     * Fecha de vencimiento como Date, o null si el lote no vence (no perecedero).
     * La usa el root para ordenar los lotes por FEFO.
     */
    public getExpiration(): Date | null {
        return this.expirationDate ? this.expirationDate.value : null;
    };



    /**
     * Fecha de recepción del lote. La usa el root como criterio de orden FIFO
     * (cuando los lotes no tienen vencimiento).
     */
    public getReceivedAt(): Date {
        return this.receivedAt;
    };



    /**
     * Valor (en dinero) de lo que AÚN queda en el lote: costo unitario × cantidad
     * restante. Es la base para valuar el inventario y para el costo promedio
     * ponderado que calcula el root. Distinto del costo total del lote recibido.
     */
    public remainingCost(): Money {
        return this.unitCost.multiply(this.quantityRemaining.getValue());
    };



    public getBranchId(): string {
        return this.branchId;
    };



    public getId(): string {
        return this.id.value;
    };



    public getUnitCost(): Money {
        return this.unitCost;
    };



    /**
     * Serializa el lote a un objeto plano (primitivas): tipos simples listos para
     * persistir o exponer. Los value objects se reducen a su valor (Quantity ->
     * string, Money -> amount + currency, vencimiento -> ISO string o null).
     * No incluye el id del item: el lote es hijo del item, y es el mapper del root
     * quien coloca la FK al persistir.
     */
    public toPrimitives(): InventoryBatchPrimitives {
        return {
            id: this.id.value,
            branchId: this.branchId,
            quantityReceived: this.quantityReceived.getValue(),
            quantityRemaining: this.quantityRemaining.getValue(),
            unitCostAmount: this.unitCost.getAmount(),
            unitCostCurrency: this.unitCost.currency,
            expirationDate: this.expirationDate ? this.expirationDate.value.toISOString() : null,
            receivedAt: this.receivedAt,
        };
    };



    /**
     * Reconstruye (rehidrata) un lote desde sus primitivas, al leerlo de la base.
     * Hace lo inverso a toPrimitives: reconstruye los value objects a partir de los
     * datos planos. No aplica reglas de negocio; solo "vuelve a armar" un lote que
     * ya existía.
     */
    public static fromPrimitives(p: InventoryBatchPrimitives): InventoryBatch {
        return new InventoryBatch(
            InventoryBatchId.create(p.id),
            p.branchId,
            Quantity.of(p.quantityReceived),
            Quantity.of(p.quantityRemaining),
            Money.of(p.unitCostAmount, p.unitCostCurrency),
            p.expirationDate ? InventoryBatchExpirationDate.create(p.expirationDate) : null,
            p.receivedAt,
        );
    };
};