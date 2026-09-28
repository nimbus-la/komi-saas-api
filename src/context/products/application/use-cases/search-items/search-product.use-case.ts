import { Paginated, Pagination } from "@/interfaces";

import { SearchProductsFilters } from "@/context/products/domain/types/product-application";
import {
    BranchNotFoundForProductsException,
    ProductRepository,
    TenantIdRequiredForSearchException,
    TenantNotFoundException,
} from "../../../domain";
import { ProductResponse } from "@/context/products/domain/types/product.response";
import { TenantChecker } from "../../ports/tenant-checker";
import { InventoryItemRecipeInfo, InventoryItemRecipeInfoProvider } from "../../ports/inventory-item-recipe-info.provider";
import { ProductCategoryProvider } from "../../ports/ProductCategoryProvider";
import { BranchChecker } from "../../ports/branch-checker";
import { resolveIngredientStockStatus } from "./ingredient-stock-status";

export class SearchProductsUseCase {
    constructor(
        private readonly repository: ProductRepository,
        private readonly tenantChecker: TenantChecker,
        private readonly recipeInfoProvider: InventoryItemRecipeInfoProvider,
        private readonly productCategoryProvider: ProductCategoryProvider,
        private readonly branchChecker: BranchChecker,
    ) { }

    public async execute(
        filters: SearchProductsFilters,
        pagination: Pagination,
    ): Promise<Paginated<ProductResponse>> {

        if (!filters.tenantId) {
            throw new TenantIdRequiredForSearchException();
        }

        const tenantExists = await this.tenantChecker.exists(
            filters.tenantId,
        );

        if (!tenantExists) {
            throw new TenantNotFoundException(filters.tenantId);
        }

        if (filters.branchId !== undefined) {
            const branchExists = await this.branchChecker.existsInTenant(
                filters.branchId,
                filters.tenantId,
            );

            if (!branchExists) {
                throw new BranchNotFoundForProductsException(filters.branchId);
            }
        }

        const { rows, pageNumber, pageSize, total } =
            await this.repository.search(filters, pagination);

        // Todos los insumos de la página en una sola carga, sin repetir ids.
        const inventoryItemIds = [
            ...new Set(
                rows.flatMap((product) =>
                    product.ingredients.map((ingredient) => ingredient.inventoryItemId),
                ),
            ),
        ];

        const recipeInfo = inventoryItemIds.length > 0
            ? await this.recipeInfoProvider.getMany(filters.tenantId, inventoryItemIds, filters.branchId)
            : new Map<string, InventoryItemRecipeInfo>();

        const products = await Promise.all(
            rows.map(async (product) => {

                const category = await this.productCategoryProvider.get(
                    filters.tenantId,
                    product.productCategoryId,
                );

                return {
                    id: product.id,
                    tenantId: product.tenantId,
                    productCategoryId: product.productCategoryId,
                    nameProductCategory: category?.name ?? "",

                    productName: product.productName,
                    productDescription: product.productDescription,
                    productSku: product.productSku,
                    productImgUrl: product.productImgUrl,
                    productBasePrice: product.productBasePrice,
                    costCurrency: product.costCurrency,
                    profitMargin: product.profitMargin,
                    productStatus: product.productStatus,

                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                    ingredients: product.ingredients.map((ingredient) => {

                        const info = recipeInfo.get(ingredient.inventoryItemId);

                        return {
                            ...ingredient,
                            name: info?.name ?? "",
                            unitOfMeasure: info?.unitOfMeasure ?? "",
                            unitCostAmount: info?.unitCostAmount ?? null,
                            lineCostAmount:
                                info?.unitCostAmount == null
                                    ? null
                                    : (
                                        Number(info.unitCostAmount) *
                                        Number(ingredient.quantity)
                                    ).toString(),
                            hasStock:
                                info
                                    ? Number(info.currentStock) >= Number(ingredient.quantity)
                                    : false,
                            // Sin sucursal no se evalúa: el campo no se incluye.
                            ...(filters.branchId !== undefined
                                ? {
                                    stockStatus: resolveIngredientStockStatus(
                                        info?.branchStock
                                            ? { isActive: info.isActive, ...info.branchStock }
                                            : null,
                                        ingredient.quantity,
                                    ),
                                }
                                : {}),
                        };
                    }),
                };
            }),
        );

        return {
            rows: products,
            pageNumber,
            pageSize,
            total,
        };
    }
}
