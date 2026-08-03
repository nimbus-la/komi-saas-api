import { ProfitMargin } from "../value-object/profit-margin.value-object";

export interface CreateProductApplicationParams {
    tenantId: string;
    productCategoryId: string;
    productName: string;
    productDescription: string | undefined;
    productImgUrl: string | undefined;
    productBasePrice: string;
    profitMargin: ProfitMargin;
    recipe?: CreateProductRecipeIngredientParams[];
}

export interface CreateProductRecipeIngredientParams {
    inventoryItemId: string;
    quantity: string;
    isOptional: boolean;
}

export interface UpdateProductApplicationParams {
    id: string;
    tenantId: string;
    productCategoryId: string;
    productName: string;
    productDescription?: string | undefined;
    productImgUrl?: string | undefined;
    productBasePrice: string;
    profitMargin: ProfitMargin;
    productStatus: boolean;
    recipe?: RecipeParams[];
}
export interface RecipeParams {
    inventoryItemId: string;
    quantity: string;
    isOptional: boolean;
}

export interface SearchProductsApplicationParams {
    productId?: string;
    tenantId: string;
    text?: string;
    productCategoryId?: string;
    productStatus?: boolean;
    productionAreaId?: string;
    page: number;
    limit: number;
}