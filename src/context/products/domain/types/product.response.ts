import { ProductPrimitives } from "./product-primitives";

/**
 * Alerta de stock del producto; el frontend decide el tono (warning o error).
 * El detalle de qué insumo falla está en el stockStatus de cada ingrediente.
 */
export type StockAlertLevel = 'WARNING' | 'ERROR';

export interface ProductResponse extends ProductPrimitives {
    createdAt: Date;
    updatedAt: Date;
    /**
     * Solo viene cuando la búsqueda recibió una sucursal. null significa que
     * todos los insumos están bien; sin sucursal el campo no se incluye.
     */
    stockAlert?: StockAlertLevel | null;
}
