export interface CreateProductApplicationParams {
    productCategoryId: string;
    productName: string;
    productDescription: string | undefined;
    productSku: string;
    productImgUrl: string | undefined;
    productBasePrice: string;
    profitMargin: number;
}
export interface UpdateProductApplicationParams {
    id: string;
    productCategoryId: string;
    productName: string;
    productDescription: string | undefined;
    productSku: string;
    productImgUrl: string | undefined;
    productBasePrice: string;
    profitMargin: number;
    productStatus: boolean;
}

export interface SearchProductsApplicationParams {
    text?: string;
    productCategoryId?: string;
    productStatus?: boolean;
    productionAreaId?: string;
    page: number;
    limit: number;
}