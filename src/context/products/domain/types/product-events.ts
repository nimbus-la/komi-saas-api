export interface ProductCreatedProps {
    productId: string;
    tenantId: string;
    productCategoryId: string;
    productName: string;
    productDescription: string | undefined;
    productSku: string;
    productImgUrl: string | undefined;
    productBasePrice: string;
    costCurrency: string;
    profitMargin: number;
    productStatus: boolean;
}