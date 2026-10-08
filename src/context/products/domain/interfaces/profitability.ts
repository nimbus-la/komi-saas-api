/**
 * Datos de entrada del cálculo de rentabilidad. Los porcentajes van de 0 a 100
 * (30 significa 30 %), igual que el margen guardado en el producto.
 */
export interface ProfitabilityInput {
    costoReceta: string;
    precioVenta?: string;
    margenObjetivo?: string;
}

/**
 * Resultado del cálculo. Si no llegó ni precio ni margen solo se conoce el
 * costo, y el resto de campos sale en null.
 */
export interface ProfitabilityResult {
    costoReceta: string;
    precioVenta: string | null;
    gananciaBruta: string | null;
    margen: string | null;
    foodCost: string | null;
    markup: string | null;
}
