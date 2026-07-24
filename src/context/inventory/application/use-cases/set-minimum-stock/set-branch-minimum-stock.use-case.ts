import { Quantity } from "@/shared";

import { BranchNotFoundException, InventoryItemId, InventoryItemNotFoundException, InventoryItemRepository } from "../../../domain";
import { BranchChecker } from "../../ports/branch-checker";
import { SetBranchMinimumStockParams } from "../../dtos/inventory-item.params";


/**
 * Configura el minimo POR SUCURSAL en lote (override del minimo global).
 *
 * Es PARCIAL: solo afecta las sucursales enviadas; las que no vengan conservan su
 * configuracion. Una entrada con minStock null elimina el override de esa sede,
 * que vuelve a heredar el minimo global.
 *
 * Todas las sucursales se validan ANTES de mutar el agregado, para que una sede
 * invalida no deje la configuracion aplicada a medias.
 */
export class SetBranchMinimumStockUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
        private readonly branchChecker: BranchChecker,
    ) { };


    public async execute(params: SetBranchMinimumStockParams): Promise<void> {
        // Carga SIN filtrar por sucursal: necesitamos todos los overrides presentes
        // para no perderlos en el upsert al guardar.
        const item = await this.repository.findById(InventoryItemId.create(params.itemId));

        if (item === null) {
            throw new InventoryItemNotFoundException(params.itemId);
        };

        for (const entry of params.branches) {
            const exists = await this.branchChecker.exists(entry.branchId);

            if (!exists) {
                throw new BranchNotFoundException(entry.branchId);
            };
        };

        item.setMinimumsForBranches(
            params.branches.map((entry) => ({
                branchId: entry.branchId,
                // Quantity.of valida que el valor sea numerico y no negativo.
                minStock: entry.minStock !== null ? Quantity.of(entry.minStock) : null,
            }))
        );

        await this.repository.save(item);
    };
};
