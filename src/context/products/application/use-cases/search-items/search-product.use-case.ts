import { SearchProductsApplicationParams } from "@/context/products/domain/types/product-application";
import {
    ProductRepository,
    TenantIdRequiredForSearchException,
} from "../../../domain";
import { ProductResponse } from "@/context/products/domain/types/product.response";
import { TenantNotFoundException } from "@/context/product-categories";
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
        params: SearchProductsApplicationParams,
    ): Promise<ProductResponse[]> {

        if (!params.tenantId) {
            throw new TenantIdRequiredForSearchException();
        }

        const tenantExists = await this.tenantChecker.exists(
            params.tenantId,
        );

        if (!tenantExists) {
            throw new TenantNotFoundException(params.tenantId);
        }

        const products = await this.repository.search(params);

        return Promise.all(
            products.map(async (product) => {

                const category = await this.productCategoryProvider.get(
                    params.tenantId,
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
                                params.tenantId,
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

    }
}