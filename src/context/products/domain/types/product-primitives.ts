import { RecipeIngredientPrimitives } from "../recipe/recipe-ingredient-primitives";

export interface ProductPrimitives {
    id: string;
    tenantId: string;
    productCategoryId: string;
    productName: string;
    productDescription: string | undefined;
    productSku: string;
    productImgUrl: string | undefined;
    productBasePrice: string;
    costCurrency: string;
    profitMargin: string;
    productStatus: boolean;

    ingredients: RecipeIngredientPrimitives[];
    createdAt: Date;
    updatedAt: Date;
}