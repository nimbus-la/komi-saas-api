/**
 * Datos que reciben los casos de uso de la configuración de producto por
 * sucursal. El tenantId siempre sale del token de quien hace la petición.
 */


/**
 * Lo que se quiere cambiar en una sucursal. Si un campo no viene, se deja como
 * está. Si viene en null, la sucursal vuelve a usar el valor del producto.
 */
export interface ProductBranchConfigEntry {
    branchId: string;
    price?: string | null;
    isAvailable?: boolean | null;
}


/** Configurar un producto en una o varias sucursales a la vez. */
export interface ConfigureProductBranchParams {
    tenantId: string;
    productId: string;
    branches: ProductBranchConfigEntry[];
}


/** Consultar las configuraciones de un producto en todas sus sucursales. */
export interface SearchProductBranchConfigsParams {
    tenantId: string;
    productId: string;
}


/** Quitar la configuración de un producto en una o varias sucursales a la vez. */
export interface RemoveProductBranchConfigParams {
    tenantId: string;
    productId: string;
    branchIds: string[];
}
