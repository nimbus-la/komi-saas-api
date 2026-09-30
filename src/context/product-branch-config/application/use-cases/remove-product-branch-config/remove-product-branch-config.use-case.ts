import { DuplicateBranchInProductConfigException, ProductBranchConfigNotFoundException } from "../../../domain/exceptions/product-branch-config.exception";
import { ProductBranchConfig } from "../../../domain/product-branch-config.aggregate";
import { ProductBranchConfigRepository } from "../../../domain/product-branch-config.repository";
import { RemoveProductBranchConfigParams } from "../../../domain/interfaces/product-branch-config-application.interface";

/**
 * Quita la configuración de un producto en varias sucursales a la vez, para
 * que esas sucursales vuelvan a usar el precio y el estado del producto.
 *
 * Funciona como todo o nada. Si alguna sucursal de la lista no tiene
 * configuración, no se borra ninguna.
 *
 * No hace falta validar el producto ni las sucursales por aparte, porque la
 * búsqueda ya filtra por negocio: lo que sea de otro negocio simplemente no
 * aparece y termina en el error 1413.
 */
export class RemoveProductBranchConfigUseCase {
    constructor(
        private readonly repository: ProductBranchConfigRepository,
    ) { }


    public async execute(params: RemoveProductBranchConfigParams): Promise<void> {
        const { tenantId, branchIds } = params;

        RemoveProductBranchConfigUseCase.ensureNoDuplicates(branchIds);

        const configs = await this.findConfigsToRemove(params);

        await this.repository.deleteMany(configs.map((config) => config.id), tenantId);
    }


    /**
     * Rechaza la lista si trae la misma sucursal dos veces. Borrarla dos veces
     * no haría daño, pero casi siempre indica un error de quien arma la lista.
     */
    private static ensureNoDuplicates(branchIds: string[]): void {
        const seen = new Set<string>();

        for (const branchId of branchIds) {
            if (seen.has(branchId)) {
                throw new DuplicateBranchInProductConfigException(branchId);
            }

            seen.add(branchId);
        }
    }


    /**
     * Busca la configuración de cada sucursal de la lista. Trae todas las del
     * producto en una sola consulta y las ubica por sucursal. Si una sucursal
     * no tiene configuración, se detiene antes de borrar nada.
     */
    private async findConfigsToRemove(params: RemoveProductBranchConfigParams): Promise<ProductBranchConfig[]> {
        const { tenantId, productId, branchIds } = params;

        const current = await this.repository.findByProduct(tenantId, productId);
        const currentByBranch = new Map(current.map((config) => [config.getBranchId(), config]));

        return branchIds.map((branchId) => {
            const config = currentByBranch.get(branchId);

            if (!config) {
                throw new ProductBranchConfigNotFoundException(productId, branchId);
            }

            return config;
        });
    }
}
