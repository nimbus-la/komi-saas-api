import { Entity, Quantity } from "@/shared";
import { InventoryStockId } from "./inventory-stock-id.value-object";
import { InventoryStockPrimitives } from "../../types/domain.types";


/**
 * Override de stock mínimo de un item PARA UNA SUCURSAL concreta. Es una ENTIDAD
 * hija del agregado InventoryItem (no un aggregate root): existe solo dentro de
 * un item y se accede a través de él.
 *
 * IMPORTANTE: aquí NO se guarda el stock disponible. El stock se calcula "al
 * vuelo" sumando los lotes activos de la sucursal (ver InventoryItem). Esta
 * entidad solo persiste el UMBRAL MÍNIMO configurado para la sede, que SOBRE-
 * ESCRIBE al mínimo global del item. Una sucursal sin fila aquí deriva del global.
 */
export class InventoryStock extends Entity<InventoryStockId> {
    private readonly branchId: string;
    private minStock: Quantity;



    private constructor(
        id: InventoryStockId,
        branchId: string,
        minStock: Quantity
    ) {
        super(id);

        this.branchId = branchId;
        this.minStock = minStock;
    };



    /**
     * Fábrica de un override NUEVO para una sucursal. La cantidad ya viene
     * validada como no-negativa por el value object Quantity. No registra eventos:
     * eso es responsabilidad del root (InventoryItem).
     */
    public static create(params: {
        branchId: string;
        minStock: Quantity;
    }): InventoryStock {
        return new InventoryStock(
            InventoryStockId.generate(),
            params.branchId,
            params.minStock
        );
    };



    /** Cambia el mínimo configurado para la sucursal. */
    public changeMinimum(minStock: Quantity): void {
        this.minStock = minStock;
    };



    public getBranchId(): string {
        return this.branchId;
    };



    public getMinStock(): Quantity {
        return this.minStock;
    };



    public toPrimitives(): InventoryStockPrimitives {
        return {
            id: this.id.value,
            branchId: this.branchId,
            minStock: this.minStock.getValue(),
        };
    };



    public static fromPrimitives(p: InventoryStockPrimitives): InventoryStock {
        return new InventoryStock(
            InventoryStockId.create(p.id),
            p.branchId,
            Quantity.of(p.minStock),
        );
    };
};