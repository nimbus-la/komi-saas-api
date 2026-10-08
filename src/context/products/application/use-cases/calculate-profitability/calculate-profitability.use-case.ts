import { Money } from "@/shared";

import { TenantNotFoundException } from "@/context/products/domain/exceptions/product-exception";
import { ProfitabilityCalculator } from "@/context/products/application/use-cases/calculate-profitability/profitability-calculator";
import { ProfitabilityResult } from "@/context/products/domain/interfaces/profitability";
import { TenantChecker } from "../../ports/tenant-checker";

// Recetas: desconectado en esta versión. El costo salía de sumar los insumos
// de la receta; vuelve cuando se reconecten las recetas.
// import Decimal from "decimal.js";
// import { Quantity } from "@/shared";
// import { IngredientWithoutCostException } from "@/context/products/domain/exceptions/product-exception";
// import { DuplicateIngredientException } from "@/context/products/domain/recipe/exceptions/duplicate-ingredient.exception";
// import { InventoryItemNotValidForTenantException } from "@/context/products/domain/recipe/exceptions/inventory-item-not-valid-for-tenant.exception";
// import { InventoryItemRecipeInfoProvider } from "../../ports/inventory-item-recipe-info.provider";
//
// export interface ProfitabilityRecipeLine {
//     inventoryItemId: string;
//     quantity: string;
// }

export interface CalculateProfitabilityParams {
    tenantId: string;
    /** Costo del producto, lo escribe el usuario. */
    cost: string;
    price?: string;
    targetMargin?: string;
}

/**
 * Simula la rentabilidad de un producto a partir de su costo, sin que tenga
 * que existir todavía.
 */
export class CalculateProfitabilityUseCase {
    constructor(
        private readonly tenantChecker: TenantChecker,
        // Recetas: desconectado en esta versión.
        // private readonly recipeInfoProvider: InventoryItemRecipeInfoProvider,
    ) { }

    /**
     * Revisa el negocio, normaliza el costo y el precio a dos decimales y le
     * pasa todo a la calculadora junto con el margen que haya llegado.
     */
    public async execute(params: CalculateProfitabilityParams): Promise<ProfitabilityResult> {
        await this.ensureTenantExists(params.tenantId);

        return ProfitabilityCalculator.calculate({
            cost: Money.of(params.cost).getAmount(),
            ...(params.price !== undefined ? { price: Money.of(params.price).getAmount() } : {}),
            ...(params.targetMargin !== undefined ? { targetMargin: params.targetMargin } : {}),
        });
    }

    private async ensureTenantExists(tenantId: string): Promise<void> {
        if (!(await this.tenantChecker.exists(tenantId))) {
            throw new TenantNotFoundException(tenantId);
        }
    }

    // Recetas: desconectado en esta versión.
    //
    // /** Un insumo repetido duplicaría su costo sin que nadie lo note. */
    // private ensureNoDuplicates(receta: ProfitabilityRecipeLine[]): void {
    //     const vistos = new Set<string>();
    //
    //     for (const { inventoryItemId } of receta) {
    //         if (vistos.has(inventoryItemId)) {
    //             throw new DuplicateIngredientException(inventoryItemId);
    //         }
    //         vistos.add(inventoryItemId);
    //     }
    // }
    //
    // /**
    //  * Carga todos los insumos en una sola consulta y suma costo por cantidad.
    //  * Falla si un insumo no es del negocio o si no tiene costo conocido.
    //  */
    // private async recipeCost(tenantId: string, receta: ProfitabilityRecipeLine[]): Promise<string> {
    //     const info = await this.recipeInfoProvider.getMany(
    //         tenantId,
    //         receta.map((line) => line.inventoryItemId),
    //     );
    //
    //     const total = receta.reduce((suma, line) => {
    //         const item = info.get(line.inventoryItemId);
    //
    //         if (item === undefined) {
    //             throw new InventoryItemNotValidForTenantException(line.inventoryItemId, tenantId);
    //         }
    //
    //         if (item.unitCostAmount === null) {
    //             throw new IngredientWithoutCostException(line.inventoryItemId);
    //         }
    //
    //         return suma.plus(new Decimal(item.unitCostAmount).times(Quantity.of(line.quantity).getValue()));
    //     }, new Decimal(0));
    //
    //     return total.toString();
    // }
}
