/** Unidades de medida soportadas para el inventario. Ampliable según necesidad. */
export enum MeasurementUnit {
    Gram = 'GRAM',
    Milliliter = 'MILLILITER',
    Unit = 'UNIT',
};


/** Moneda por defecto del sistema. Cuando se soporte multi-moneda, subirá al tenant. */
export const DEFAULT_CURRENCY = 'COP';