export interface CreateProductApplicationParams {
    tenantId: string;
    productCategoryId: string;
    productName: string;
    productDescription: string | undefined;
    productImgUrl: string | undefined;
    productBasePrice: string;
    profitMargin: number;
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
    productDescription: string | undefined;
    productImgUrl: string | undefined;
    productBasePrice: string;
    profitMargin: number;
    productStatus: boolean;
}

export interface SearchProductsApplicationParams {
    tenantId: string;
    text?: string;
    productCategoryId?: string;
    productStatus?: boolean;
    productionAreaId?: string;
    page: number;
    limit: number;
}