import { Injectable } from "@nestjs/common";

import { InventoryItem, InventoryItemRepository } from "@/context/inventory";
import { InventoryItemId } from "@/context/inventory/domain/value-objects/inventory-item-id.value-object";

import {
    InventoryItemRecipeInfoProvider,
    InventoryItemRecipeInfo,
} from "@/context/products/application/ports/inventory-item-recipe-info.provider";

@Injectable()
export class InventoryItemRecipeInfoProviderAdapter
    implements InventoryItemRecipeInfoProvider {

    constructor(
        private readonly inventory: InventoryItemRepository,
    ) { }

    async getMany(
        tenantId: string,
        inventoryItemIds: string[],
        branchId?: string,
    ): Promise<Map<string, InventoryItemRecipeInfo>> {

        // Se carga el item completo (todas las sedes) para que el costo y el
        // stock general no cambien; el de la sucursal se calcula aparte.
        const items = await this.inventory.findByIds(
            inventoryItemIds.map((id) => InventoryItemId.create(id)),
            tenantId,
        );

        return new Map(
            items.map((item) => {
                const info = this.toRecipeInfo(item, branchId);
                return [info.inventoryItemId, info];
            }),
        );
    }

    private toRecipeInfo(item: InventoryItem, branchId?: string): InventoryItemRecipeInfo {
        const primitive = item.toPrimitives();

        // El repositorio también trae lotes vencidos con existencias; el dominio
        // los descarta para que no cuenten en el stock ni en el costo.
        const currentStock = item.currentStock().getValue();
        const unitCostAmount = item.weightedAverageCost()?.getAmount() ?? null;

        return {
            inventoryItemId: primitive.id,
            name: primitive.name,
            unitOfMeasure: primitive.unitOfMeasure,
            unitCostAmount,
            currentStock,
            isActive: primitive.isActive,
            ...(branchId !== undefined
                ? {
                    branchStock: {
                        currentStock: item.currentStockForBranch(branchId).getValue(),
                        minStock: item.resolveMinimumForBranch(branchId)?.getValue() ?? null,
                    },
                }
                : {}),
        };
    }
}