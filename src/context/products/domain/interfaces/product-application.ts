import { EntityStatus } from "@/shared";
import { ProfitMargin } from "../value-object/profit-margin.value-object";

export interface CreateProductApplicationParams {
    tenantId: string;
    productCategoryId: string;
    productName: string;
    productDescription: string | undefined;
    productImgUrl: string | undefined;
    productBasePrice: string;
    profitMargin: ProfitMargin;
    // Recetas: desconectado en esta versión.
    // recipe?: CreateProductRecipeIngredientParams[];
}

/** Recetas: sin uso en esta versión, se conserva para reconectarlas. */
export interface CreateProductRecipeIngredientParams {
    inventoryItemId: string;
    quantity: string;
    isOptional: boolean;
}

export interface UpdateProductApplicationParams {
    id: string;
    tenantId: string;
    productCategoryId?: string | undefined;
    productName?: string | undefined;
    productDescription?: string | undefined;
    productImgUrl?: string | undefined;
    productBasePrice?: string | undefined;
    profitMargin?: ProfitMargin;
    status?: EntityStatus | undefined;
    // Recetas: desconectado en esta versión.
    // recipe?: RecipeParams[];
}


export interface DeleteProductApplicationParams {
    id: string;
    tenantId: string;
    deletedBy: string;
}


export interface RecipeParams {
    inventoryItemId: string;
    quantity: string;
    isOptional: boolean;
}

export interface SearchProductsFilters {
    tenantId: string;
    productId?: string | undefined;
    /** Coincidencia parcial contra el nombre o el SKU del producto. */
    text?: string | undefined;
    productCategoryId?: string | undefined;
    status?: EntityStatus | undefined;
    // Sucursal: desconectado en esta versión. Definía en qué sucursal se
    // evaluaba el stock de los insumos y de dónde salían el precio y el estado
    // de cada producto.
    // branchId?: string | undefined;
}