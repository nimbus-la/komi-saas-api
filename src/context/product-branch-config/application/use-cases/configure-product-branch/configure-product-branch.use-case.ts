import { Money } from "@/shared";
import { BranchNotFoundForProductsException, ProductNotFoundException } from "@/context/products/domain/exceptions/product-exception";

import { ProductBranchConfig } from "../../../domain/product-branch-config.aggregate";
import { ProductBranchConfigRepository } from "../../../domain/product-branch-config.repository";
import { ProductBranchConfigPrimitives } from "../../../domain/interfaces/product-branch-config.interface";
import { ConfigureProductBranchParams, ProductBranchConfigEntry } from "../../../domain/interfaces/product-branch-config-application.interface";
import { DuplicateBranchInProductConfigException } from "../../../domain/exceptions/product-branch-config.exception";
import { BranchChecker } from "../../ports/branch-checker";
import { ProductChecker } from "../../ports/product-checker";

/**
 * Guarda el precio y el estado de un producto en varias sucursales a la vez.
 *
 * Funciona como todo o nada. Primero revisa la lista completa y prepara los
 * cambios sin tocar la base. Solo cuando todas las sucursales pasan se guardan
 * juntas; si una falla, no se guarda ninguna.
 *
 * Este caso de uso nunca borra. Si una sucursal quedaría sin precio ni estado
 * propios, el agregado lanza el error 1412. Para quitar una configuración está
 * el caso de uso de eliminar.
 */
export class ConfigureProductBranchUseCase {
    constructor(
        private readonly repository: ProductBranchConfigRepository,
        private readonly productChecker: ProductChecker,
        private readonly branchChecker: BranchChecker,
    ) { }


    public async execute(
        params: ConfigureProductBranchParams,
    ): Promise<ProductBranchConfigPrimitives[]> {
        const { tenantId, productId, branches } = params;

        // Todo lo que puede fallar se revisa antes de escribir en la base.
        ConfigureProductBranchUseCase.ensureNoDuplicates(branches);
        await this.ensureProductBelongsToTenant(productId, tenantId);
        await this.ensureBranchesBelongToTenant(branches, tenantId);

        const configs = await this.prepareConfigs(params);

        await this.repository.saveMany(configs);

        return this.findAllForProduct(tenantId, productId);
    }


    /**
     * Rechaza la lista si trae la misma sucursal dos veces, porque no sabríamos
     * cuál de las dos entradas debe quedar.
     */
    private static ensureNoDuplicates(branches: ProductBranchConfigEntry[]): void {
        const seen = new Set<string>();

        for (const { branchId } of branches) {
            if (seen.has(branchId)) {
                throw new DuplicateBranchInProductConfigException(branchId);
            }

            seen.add(branchId);
        }
    }


    /** El producto tiene que existir y ser del mismo negocio de quien hace la petición. */
    private async ensureProductBelongsToTenant(productId: string, tenantId: string): Promise<void> {
        const exists = await this.productChecker.existsInTenant(productId, tenantId);

        if (!exists) {
            throw new ProductNotFoundException(productId);
        }
    }


    /**
     * Cada sucursal de la lista tiene que ser del negocio. Con que una no lo
     * sea se detiene todo, y así nunca queda la lista aplicada a medias.
     */
    private async ensureBranchesBelongToTenant(
        branches: ProductBranchConfigEntry[],
        tenantId: string,
    ): Promise<void> {
        for (const { branchId } of branches) {
            const exists = await this.branchChecker.existsInTenant(branchId, tenantId);

            if (!exists) {
                throw new BranchNotFoundForProductsException(branchId);
            }
        }
    }


    /**
     * Arma en memoria la configuración final de cada sucursal de la lista. Las
     * configuraciones que ya existen se traen en una sola consulta y se ubican
     * por sucursal, en vez de ir a la base una vez por cada entrada.
     */
    private async prepareConfigs(params: ConfigureProductBranchParams): Promise<ProductBranchConfig[]> {
        const { tenantId, productId, branches } = params;

        const current = await this.repository.findByProduct(tenantId, productId);
        const currentByBranch = new Map(current.map((config) => [config.getBranchId(), config]));

        return branches.map((entry) => {
            const existing = currentByBranch.get(entry.branchId);

            if (existing) {
                ConfigureProductBranchUseCase.applyChanges(existing, entry);
                return existing;
            }

            return ConfigureProductBranchUseCase.createConfig(tenantId, productId, entry);
        });
    }


    /**
     * Crea la configuración de una sucursal que todavía no tenía. Lo que no
     * venga en la entrada queda en null, es decir, se toma del producto.
     */
    private static createConfig(
        tenantId: string,
        productId: string,
        entry: ProductBranchConfigEntry,
    ): ProductBranchConfig {
        return ProductBranchConfig.create({
            tenantId,
            productId,
            branchId: entry.branchId,
            price: ConfigureProductBranchUseCase.toMoney(entry.price ?? null),
            isAvailable: entry.isAvailable ?? null,
        });
    }


    /**
     * Cambia una configuración que ya existía. Solo se pasan al agregado los
     * campos que vienen en la entrada, para que los demás se queden como estaban.
     */
    private static applyChanges(config: ProductBranchConfig, entry: ProductBranchConfigEntry): void {
        config.change({
            ...(entry.price !== undefined ? { price: ConfigureProductBranchUseCase.toMoney(entry.price) } : {}),
            ...(entry.isAvailable !== undefined ? { isAvailable: entry.isAvailable } : {}),
        });
    }


    /**
     * Devuelve todas las configuraciones del producto como quedaron, incluidas
     * las de sucursales que no venían en la lista. Así el front ve el estado
     * completo con una sola respuesta.
     */
    private async findAllForProduct(tenantId: string, productId: string): Promise<ProductBranchConfigPrimitives[]> {
        const configs = await this.repository.findByProduct(tenantId, productId);

        return configs.map((config) => config.toPrimitives());
    }


    /** Convierte el precio que llega como texto al valor de dinero del dominio; null se deja igual. */
    private static toMoney(price: string | null): Money | null {
        return price === null ? null : Money.of(price);
    }
}
