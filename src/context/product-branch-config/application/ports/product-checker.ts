/**
 * Puerto: antes de configurar un producto en una sucursal hay que saber si el
 * producto existe DENTRO del negocio. El tenantId es obligatorio para no poder
 * configurar productos de otro negocio.
 */
export abstract class ProductChecker {
    abstract existsInTenant(productId: string, tenantId: string): Promise<boolean>;
};
