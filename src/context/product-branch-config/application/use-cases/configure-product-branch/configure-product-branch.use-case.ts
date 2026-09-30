import { Money } from "@/shared";
import { BranchNotFoundForProductsException, ProductNotFoundException } from "@/context/products/domain/exceptions/product-exception";

import { ProductBranchConfig } from "../../../domain/product-branch-config.aggregate";
import { ProductBranchConfigRepository } from "../../../domain/product-branch-config.repository";
import { ProductBranchConfigPrimitives } from "../../../domain/interfaces/product-branch-config.interface";
import { BranchChecker } from "../../ports/branch-checker";
import { ProductChecker } from "../../ports/product-checker";

/**
 * Un campo ausente no se toca; un campo en null vuelve a heredar el valor del
 * producto.
 */
export interface ConfigureProductBranchParams {
    tenantId: string;
    productId: string;
    branchId: string;
    price?: string | null;
    isAvailable?: boolean | null;
}

/**
 * Crea o cambia el precio y el estado de un producto en una sucursal. Si la
 * configuración deja de sobrescribir algo, se borra y se devuelve null.
 */
export class ConfigureProductBranchUseCase {
    constructor(
        private readonly repository: ProductBranchConfigRepository,
        private readonly productChecker: ProductChecker,
        private readonly branchChecker: BranchChecker,
    ) { }

    public async execute(
        params: ConfigureProductBranchParams,
    ): Promise<ProductBranchConfigPrimitives | null> {
        const { tenantId, productId, branchId } = params;

        if (!await this.productChecker.existsInTenant(productId, tenantId)) {
            throw new ProductNotFoundException(productId);
        }

        if (!await this.branchChecker.existsInTenant(branchId, tenantId)) {
            throw new BranchNotFoundForProductsException(branchId);
        }

        const current = await this.repository.findByProductAndBranch(tenantId, productId, branchId);

        if (!current) {
            const config = ProductBranchConfig.create({
                tenantId,
                productId,
                branchId,
                price: ConfigureProductBranchUseCase.toMoney(params.price ?? null),
                isAvailable: params.isAvailable ?? null,
            });

            await this.repository.save(config);

            return config.toPrimitives();
        }

        if (params.price !== undefined) {
            current.changePrice(ConfigureProductBranchUseCase.toMoney(params.price));
        }

        if (params.isAvailable !== undefined) {
            current.changeAvailability(params.isAvailable);
        }

        if (current.isEmpty()) {
            await this.repository.delete(current.id, tenantId);

            return null;
        }

        await this.repository.save(current);

        return current.toPrimitives();
    }

    private static toMoney(price: string | null): Money | null {
        return price === null ? null : Money.of(price);
    }
}
