/** Tipos de movimiento de inventario. ENTRY/CONSUMPTION se generan por eventos;
 *  WASTE y ADJUSTMENT_* quedan listos para sus futuros casos de uso. */
export enum MovementType {
    Entry = 'ENTRY',                    // recepción de mercancía
    Consumption = 'CONSUMPTION',        // salida por uso/venta
    Waste = 'WASTE',                    // merma (vencido, dañado)
    AdjustmentIn = 'ADJUSTMENT_IN',     // corrección que suma
    AdjustmentOut = 'ADJUSTMENT_OUT',   // corrección que resta
};