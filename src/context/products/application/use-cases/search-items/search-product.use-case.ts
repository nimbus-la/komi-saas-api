import { Paginated, Pagination } from "@/interfaces";

import { SearchProductsFilters } from "@/context/products/domain/interfaces/product-application";
import {
    ProductRepository,
    TenantIdRequiredForSearchException,
    TenantNotFoundException,
} from "../../../domain";
import { ProductResponse } from "@/context/products/domain/interfaces/product.response";
import { TenantChecker } from "../../ports/tenant-checker";
import { ProductCategoryProvider } from "../../ports/ProductCategoryProvider";

// Recetas y sucursal: desconectado en esta versión. Vuelven con la evaluación
// del stock de los insumos por sucursal.
// import { BranchNotFoundForProductsException } from "../../../domain";
// import { InventoryItemRecipeInfo, InventoryItemRecipeInfoProvider } from "../../ports/inventory-item-recipe-info.provider";
// import { BranchChecker } from "../../ports/branch-checker";
// import { resolveIngredientStockStatus } from "./ingredient-stock-status";
// import { buildProductStockAlert, IngredientStockEvaluation } from "./product-stock-alert";
// import { RecipeIngredientPrimitives } from "@/context/products/domain/recipe/recipe-ingredient-primitives";

export class SearchProductsUseCase {
    constructor(
        private readonly repository: ProductRepository,
        private readonly tenantChecker: TenantChecker,
        private readonly productCategoryProvider: ProductCategoryProvider,
        // Recetas y sucursal: desconectado en esta versión.
        // private readonly recipeInfoProvider: InventoryItemRecipeInfoProvider,
        // private readonly branchChecker: BranchChecker,
    ) { }

    /**
     * Valida el negocio, busca la página y le agrega a cada producto el nombre
     * de su categoría.
     */
    public async execute(filters: SearchProductsFilters, pagination: Pagination): Promise<Paginated<ProductResponse>> {
        if (!filters.tenantId) {
            throw new TenantIdRequiredForSearchException();
        }

        const tenantExists = await this.tenantChecker.exists(
            filters.tenantId,
        );

        if (!tenantExists) {
            throw new TenantNotFoundException(filters.tenantId);
        }

        const { rows, pageNumber, pageSize, total } =
            await this.repository.search(filters, pagination);

        const products = await Promise.all(
            rows.map(async (product) => {
                const category = await this.productCategoryProvider.get(
                    filters.tenantId,
                    product.categoryId,
                );

                return { ...product, categoryName: category?.name ?? "" };
            }),
        );

        return {
            rows: products,
            pageNumber,
            pageSize,
            total,
        };
    }

    // Recetas y sucursal: desconectado en esta versión. Antes de buscar se
    // validaba la sucursal, y después cada producto se armaba con sus insumos,
    // sus costos, el stockStatus de cada ingrediente y la alerta del producto.
    //
    // if (filters.branchId !== undefined) {
    //     const branchExists = await this.branchChecker.existsInTenant(
    //         filters.branchId,
    //         filters.tenantId,
    //     );
    //
    //     if (!branchExists) {
    //         throw new BranchNotFoundForProductsException(filters.branchId);
    //     }
    // }
    //
    // // Todos los insumos de la página en una sola carga, sin repetir ids.
    // const inventoryItemIds = [
    //     ...new Set(
    //         rows.flatMap((product) =>
    //             product.ingredients.map((ingredient) => ingredient.inventoryItemId),
    //         ),
    //     ),
    // ];
    //
    // const recipeInfo = inventoryItemIds.length > 0
    //     ? await this.recipeInfoProvider.getMany(filters.tenantId, inventoryItemIds, filters.branchId)
    //     : new Map<string, InventoryItemRecipeInfo>();
    //
    // const { branchId } = filters;
    //
    // Dentro del map de cada producto:
    //
    // // Cada insumo se evalúa una vez; el resultado alimenta tanto el
    // // stockStatus del ingrediente como la alerta del producto.
    // const evaluated = product.ingredients.map((ingredient) => {
    //     const info = recipeInfo.get(ingredient.inventoryItemId);
    //
    //     return {
    //         ingredient,
    //         info,
    //         stock: branchId !== undefined
    //             ? this.evaluateStock(ingredient, info)
    //             : undefined,
    //     };
    // });
    //
    // ingredients: evaluated.map(({ ingredient, info, stock }) => ({
    //     ...ingredient,
    //     name: info?.name ?? "",
    //     unitOfMeasure: info?.unitOfMeasure ?? "",
    //     unitCostAmount: info?.unitCostAmount ?? null,
    //     lineCostAmount:
    //         info?.unitCostAmount == null
    //             ? null
    //             : (Number(info.unitCostAmount) * Number(ingredient.quantity)).toString(),
    //     hasStock:
    //         info
    //             ? Number(info.currentStock) >= Number(ingredient.quantity)
    //             : false,
    //     // Sin sucursal no se evalúa: el campo no se incluye.
    //     ...(stock !== undefined ? { stockStatus: stock.status } : {}),
    // })),
    // ...(branchId !== undefined
    //     ? {
    //         stockAlert: buildProductStockAlert(
    //             evaluated.flatMap(({ stock }) => (stock !== undefined ? [stock] : [])),
    //         ),
    //     }
    //     : {}),
    //
    // /**
    //  * Estado de un insumo en la sucursal. Si no vino del inventario (borrado o de
    //  * otro negocio) se reporta agotado.
    //  */
    // private evaluateStock(
    //     ingredient: RecipeIngredientPrimitives,
    //     info: InventoryItemRecipeInfo | undefined,
    // ): IngredientStockEvaluation {
    //     const branchStock = info?.branchStock;
    //
    //     return {
    //         status: resolveIngredientStockStatus(
    //             info !== undefined && branchStock !== undefined
    //                 ? { isActive: info.isActive, ...branchStock }
    //                 : null,
    //             ingredient.quantity,
    //         ),
    //         isOptional: ingredient.isOptional,
    //     };
    // }
}
