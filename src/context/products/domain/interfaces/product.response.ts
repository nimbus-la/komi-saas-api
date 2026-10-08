import { EntityStatus } from "@/shared";

import { ProductPrimitives } from "./product-primitives";

/** Respuesta del producto en esta versión: sin receta ni datos de sucursal. */
export interface ProductResponse {
    id: string;
    sku: string;
    name: string;
    categoryId: string;
    /** La completa SearchProductsUseCase; el repositorio no la conoce. */
    categoryName?: string;
    description: string | undefined;
    imageUrl: string | undefined;
    price: string;
    currency: string;
    targetMargin: string;
    status: EntityStatus;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Alerta de stock del producto; el frontend decide el tono (warning o error).
 * El detalle de qué insumo falla está en el stockStatus de cada ingrediente.
 */
export type StockAlertLevel = 'WARNING' | 'ERROR';

/**
 * Recetas y sucursal: desconectado en esta versión.
 * Es la respuesta anterior, con la receta y la alerta de stock. Se conserva
 * para reconectarla cuando vuelvan las recetas; hoy solo la usa
 * ProductMapper.toRecipeResponse.
 */
export interface ProductWithRecipeResponse extends ProductPrimitives {
    createdAt: Date;
    updatedAt: Date;
    /**
     * Solo viene cuando la búsqueda recibió una sucursal. null significa que
     * todos los insumos están bien; sin sucursal el campo no se incluye.
     */
    stockAlert?: StockAlertLevel | null;
}
