import { InventoryItem } from "../../domain/inventory-item.aggregate";
import { InventoryItemResponse } from "../types/application.types";

export const toInventoryItemResponse = (
    item: InventoryItem,
    date: Date = new Date(),
): InventoryItemResponse => {
    const p = item.toPrimitives();
    const weighted = item.weightedAverageCost(date);

    return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        unitOfMeasure: p.unitOfMeasure,
        standardCostAmount: p.costAmount,
        effectiveCostAmount: weighted ? weighted.getAmount() : p.costAmount,
        costSource: weighted ? 'BATCHES' : 'STANDARD',
        costCurrency: p.costCurrency,
        isPerishable: p.isPerishable,
        isActive: p.isActive,
        currentStock: item.currentStock(date).getValue(),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
    };
};