import { Quantity } from "@/shared";
import { BranchNotFoundException, InventoryItemNotFoundException, MinimumStockValueRequiredException } from "../../domain/exceptions/inventory-item.exceptions";
import { InventoryItemRepository } from "../../domain/inventory-item.repository";
import { InventoryItemId } from "../../domain/value-objects/inventory-item-id.value-object";
import { BranchChecker } from "../ports/branch-checker";

export interface SetMinimumStockParams {
    itemId: string;
    branchId?: string;        // ausente: mínimo GLOBAL; presente: override de la sucursal
    minStock: string | null;  // null (solo global): limpia el mínimo global
};


export class SetMinimumStockUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
        private readonly branchChecker: BranchChecker,
    ) { };

    public async execute(params: SetMinimumStockParams): Promise<void> {
        // Carga SIN filtrar por sucursal: necesitamos todos los overrides presentes
        // para no perderlos en el upsert al guardar.
        const item = await this.repository.findById(InventoryItemId.create(params.itemId));

        if (item === null) {
            throw new InventoryItemNotFoundException(params.itemId);
        };

        if (params.branchId !== undefined) {
            if (!(await this.branchChecker.exists(params.branchId))) {
                throw new BranchNotFoundException(params.branchId);
            };

            if (params.minStock === null) {
                throw new MinimumStockValueRequiredException(params.branchId);
            };

            item.setBranchMinimum(params.branchId, Quantity.of(params.minStock));
        } else {
            item.setGlobalMinimum(
                params.minStock === null ?
                    null
                    : Quantity.of(params.minStock)
            );
        };

        await this.repository.save(item);
    };
};