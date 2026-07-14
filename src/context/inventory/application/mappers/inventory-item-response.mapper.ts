import { InventoryItem } from "../../domain";
import { DEFAULT_CURRENCY } from "../../domain/common/constants.common";
import { InventoryItemResponse } from "../dtos/inventory-item.response";


export interface ToResponseOptions {
    branchId?: string;
    date?: Date;
};


export const toInventoryItemResponse = (
    item: InventoryItem,
    options: ToResponseOptions = {},
): InventoryItemResponse => {
    const date = options.date ?? new Date();
    const { branchId } = options;

    const p = item.toPrimitives();
    const weighted = item.weightedAverageCost(date);

    // Con sucursal: mínimo efectivo (override ?? global) y estado bajo-mínimo de esa sede.
    // Sin sucursal: solo tiene sentido reportar el global; el estado queda indeterminado.
    const minStock = branchId !== undefined
        ? (item.minimumStockFor(branchId)?.getValue() ?? null)
        : p.minGlobalStock;

    const isBelowMinimum = branchId !== undefined
        ? item.isBelowMinimumFor(branchId, date)
        : null;

    return {
        id: p.id,
        tenantId: p.tenantId,
        sku: p.sku,
        name: p.name,
        unitOfMeasure: p.unitOfMeasure,
        effectiveCostAmount: weighted ? weighted.getAmount() : null,
        currency: DEFAULT_CURRENCY,
        isPerishable: p.isPerishable,
        isActive: p.isActive,
        currentStock: item.currentStock(date).getValue(),
        minStock,
        isBelowMinimum,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
    };
};