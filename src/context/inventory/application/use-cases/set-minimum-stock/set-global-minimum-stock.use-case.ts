import { Quantity } from "@/shared";

import { InventoryItemId, InventoryItemNotFoundException, InventoryItemRepository } from "../../../domain";
import { SetGlobalMinimumStockParams } from "../../dtos/inventory-item.params";


/**
 * Configura el minimo GLOBAL del item: el umbral por defecto que aplica a toda
 * sucursal que no tenga un override propio.
 *
 * No toca los overrides existentes: una sucursal con minimo propio lo conserva,
 * porque lo especifico gana sobre lo general. Para cambiar una sede se usa
 * SetBranchMinimumStockUseCase.
 *
 * minStock null limpia el minimo global (el item deja de tener politica de
 * minimos y nunca se reporta bajo minimo).
 */
export class SetGlobalMinimumStockUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
    ) { };


    public async execute(params: SetGlobalMinimumStockParams): Promise<void> {
        // Carga SIN filtrar por sucursal: necesitamos todos los overrides presentes
        // para no perderlos en el upsert al guardar.
        const item = await this.repository.findById(InventoryItemId.create(params.itemId));

        if (item === null) {
            throw new InventoryItemNotFoundException(params.itemId);
        };

        // Quantity.of valida que el valor sea numerico y no negativo.
        const minStock = params.minStock !== null
            ? Quantity.of(params.minStock)
            : null;

        item.setGlobalMinimum(minStock);

        await this.repository.save(item);
    };
};
