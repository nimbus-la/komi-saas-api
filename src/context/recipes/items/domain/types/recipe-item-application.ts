export interface CreateRecipeItemApplicationParams {
    productId: string;
    inventoryItemId: string;
    quantity: string;
    unit: string;
    lineCost: string;
    isOptional: boolean;
}

export interface UpdateRecipeItemApplicationParams {
    id: string;
    productId: string;
    inventoryItemId: string;
    quantity: string;
    unit: string;
    lineCost: string;
    isOptional: boolean;
}

export interface SearchRecipeItemsApplicationParams {
    productId?: string;
    inventoryItemId?: string;
    page: number;
    limit: number;
}