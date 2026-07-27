import { Entity, Quantity } from "@/shared";
import { InventoryBranchConfigId } from "./inventory-branch-config-id.value-object";
import { InventoryBranchConfigPrimitives } from "../../types/domain.types";


/**
 * Configuración de inventario de un item PARA UNA SUCURSAL concreta. Es una
 * ENTIDAD hija del agregado InventoryItem (no un aggregate root): existe solo
 * dentro de un item y se accede a través de él.
 *
 * IMPORTANTE: aquí NO se guarda el stock disponible. El stock se calcula "al
 * vuelo" sumando los lotes activos de la sucursal (ver InventoryItem). Esta
 * entidad solo persiste el UMBRAL MÍNIMO configurado para la sede, que SOBRE-
 * ESCRIBE al mínimo global del item. Una sucursal sin fila aquí deriva del global.
 */
export class InventoryBranchConfig extends Entity<InventoryBranchConfigId> {
    private readonly branchId: string;
    private minStock: Quantity;



    private constructor(
        id: InventoryBranchConfigId,
        branchId: string,
        minStock: Quantity
    ) {
        super(id);

        this.branchId = branchId;
        this.minStock = minStock;
    };



    /**
     * Fábrica de una configuración NUEVA para una sucursal. La cantidad ya viene
     * validada como no-negativa por el value object Quantity. No registra eventos:
     * eso es responsabilidad del root (InventoryItem).
     */
    public static create(params: {
        branchId: string;
        minStock: Quantity;
    }): InventoryBranchConfig {
        return new InventoryBranchConfig(
            InventoryBranchConfigId.generate(),
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



    public toPrimitives(): InventoryBranchConfigPrimitives {
        return {
            id: this.id.value,
            branchId: this.branchId,
            minStock: this.minStock.getValue(),
        };
    };



    public static fromPrimitives(p: InventoryBranchConfigPrimitives): InventoryBranchConfig {
        return new InventoryBranchConfig(
            InventoryBranchConfigId.create(p.id),
            p.branchId,
            Quantity.of(p.minStock),
        );
    };
};
