import { Paginated, Pagination } from "@/interfaces";

import { SearchProductsFilters } from "@/context/products/domain/types/product-application";
import {
    ProductRepository,
    TenantIdRequiredForSearchException,
    TenantNotFoundException,
} from "../../../domain";
import { ProductResponse } from "@/context/products/domain/types/product.response";
import { TenantChecker } from "../../ports/tenant-checker";
import { InventoryItemRecipeInfoProvider } from "../../ports/inventory-item-recipe-info.provider";
import { ProductCategoryProvider } from "../../ports/ProductCategoryProvider";

export class SearchProductsUseCase {
    constructor(
        private readonly repository: ProductRepository,
        private readonly tenantChecker: TenantChecker,
        private readonly recipeInfoProvider: InventoryItemRecipeInfoProvider,
        private readonly productCategoryProvider: ProductCategoryProvider,

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

        const { rows, pageNumber, pageSize, total } =
            await this.repository.search(filters, pagination);

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
                    ingredients: await Promise.all(
                        product.ingredients.map(async (ingredient) => {

                            const info = await this.recipeInfoProvider.get(
                                filters.tenantId,
                                ingredient.inventoryItemId,
                            );

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
                            };
                        }),
                    ),
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
