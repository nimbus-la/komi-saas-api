import Decimal from "decimal.js";

import { Money, Quantity } from "@/shared";

import {
    IngredientWithoutCostException,
    TenantNotFoundException,
} from "@/context/products/domain/exceptions/product-exception";
import { DuplicateIngredientException } from "@/context/products/domain/recipe/exceptions/duplicate-ingredient.exception";
import { InventoryItemNotValidForTenantException } from "@/context/products/domain/recipe/exceptions/inventory-item-not-valid-for-tenant.exception";
import { ProfitabilityCalculator } from "@/context/products/application/use-cases/calculate-profitability/profitability-calculator";
import { ProfitabilityResult } from "@/context/products/domain/interfaces/profitability";
import { TenantChecker } from "../../ports/tenant-checker";
import { InventoryItemRecipeInfoProvider } from "../../ports/inventory-item-recipe-info.provider";

export interface ProfitabilityRecipeLine {
    inventoryItemId: string;
    quantity: string;
}

export interface CalculateProfitabilityParams {
    tenantId: string;
    receta: ProfitabilityRecipeLine[];
    precioVenta?: string;
    margenObjetivo?: string;
}

/**
 * Simula la rentabilidad de una receta que todavía no tiene que existir como
 * producto. El costo de cada insumo es el promedio de sus lotes con existencias.
 */
export class CalculateProfitabilityUseCase {
    constructor(
        private readonly tenantChecker: TenantChecker,
        private readonly recipeInfoProvider: InventoryItemRecipeInfoProvider,
    ) { }

    /**
     * Revisa el negocio y la receta, suma el costo de los insumos y le pasa ese
     * costo a la calculadora junto con el precio o el margen que hayan llegado.
     */
    public async execute(params: CalculateProfitabilityParams): Promise<ProfitabilityResult> {
        await this.ensureTenantExists(params.tenantId);
        this.ensureNoDuplicates(params.receta);

        const costoReceta = await this.recipeCost(params.tenantId, params.receta);

        return ProfitabilityCalculator.calculate({
            costoReceta,
            ...(params.precioVenta !== undefined ? { precioVenta: Money.of(params.precioVenta).getAmount() } : {}),
            ...(params.margenObjetivo !== undefined ? { margenObjetivo: params.margenObjetivo } : {}),
        });
    }

    private async ensureTenantExists(tenantId: string): Promise<void> {
        if (!(await this.tenantChecker.exists(tenantId))) {
            throw new TenantNotFoundException(tenantId);
        }
    }

    /** Un insumo repetido duplicaría su costo sin que nadie lo note. */
    private ensureNoDuplicates(receta: ProfitabilityRecipeLine[]): void {
        const vistos = new Set<string>();

        for (const { inventoryItemId } of receta) {
            if (vistos.has(inventoryItemId)) {
                throw new DuplicateIngredientException(inventoryItemId);
            }
            vistos.add(inventoryItemId);
        }
    }

    /**
     * Carga todos los insumos en una sola consulta y suma costo por cantidad.
     * Falla si un insumo no es del negocio o si no tiene costo conocido.
     */
    private async recipeCost(tenantId: string, receta: ProfitabilityRecipeLine[]): Promise<string> {
        const info = await this.recipeInfoProvider.getMany(
            tenantId,
            receta.map((line) => line.inventoryItemId),
        );

        const total = receta.reduce((suma, line) => {
            const item = info.get(line.inventoryItemId);

            if (item === undefined) {
                throw new InventoryItemNotValidForTenantException(line.inventoryItemId, tenantId);
            }

            if (item.unitCostAmount === null) {
                throw new IngredientWithoutCostException(line.inventoryItemId);
            }

            return suma.plus(new Decimal(item.unitCostAmount).times(Quantity.of(line.quantity).getValue()));
        }, new Decimal(0));

        return total.toString();
    }
}
