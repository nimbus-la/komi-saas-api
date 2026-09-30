import { Money } from "@/shared";

import { ProductBranchConfig } from "../../../domain/product-branch-config.aggregate";
import { ConfigureProductBranchUseCase } from "./configure-product-branch.use-case";

const TENANT_ID = "550e8400-e29b-41d4-a716-446655440000";
const PRODUCT_ID = "7a1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const BRANCH_ID = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";

const ids = { tenantId: TENANT_ID, productId: PRODUCT_ID, branchId: BRANCH_ID };

const buildHarness = (options: {
    current?: ProductBranchConfig | null;
    productExists?: boolean;
    branchExists?: boolean;
} = {}) => {
    const repository = {
        findByProductAndBranch: jest.fn().mockResolvedValue(options.current ?? null),
        save: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new ConfigureProductBranchUseCase(
        repository as never,
        { existsInTenant: jest.fn().mockResolvedValue(options.productExists ?? true) },
        { existsInTenant: jest.fn().mockResolvedValue(options.branchExists ?? true) },
    );

    return { useCase, repository };
};

describe("ConfigureProductBranchUseCase", () => {
    it("rechaza un producto que no es del negocio", async () => {
        const { useCase, repository } = buildHarness({ productExists: false });

        await expect(useCase.execute({ ...ids, price: "1000" }))
            .rejects.toMatchObject({ code: "1400" });
        expect(repository.save).not.toHaveBeenCalled();
    });

    it("rechaza una sucursal que no es del negocio", async () => {
        const { useCase, repository } = buildHarness({ branchExists: false });

        await expect(useCase.execute({ ...ids, price: "1000" }))
            .rejects.toMatchObject({ code: "1410" });
        expect(repository.save).not.toHaveBeenCalled();
    });

    it("crea la configuración solo con precio y deja el estado heredado", async () => {
        const { useCase, repository } = buildHarness();

        const result = await useCase.execute({ ...ids, price: "18000" });

        expect(result).toMatchObject({ price: "18000.00", currency: "COP", isAvailable: null });
        expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it("en una configuración existente solo cambia el campo enviado", async () => {
        const current = ProductBranchConfig.create({ ...ids, price: Money.of("18000"), isAvailable: true });
        const { useCase, repository } = buildHarness({ current });

        const result = await useCase.execute({ ...ids, isAvailable: false });

        expect(result).toMatchObject({ id: current.id.value, price: "18000.00", isAvailable: false });
        expect(repository.save).toHaveBeenCalledWith(current);
    });

    it("borra la configuración cuando todo vuelve a heredarse del producto", async () => {
        const current = ProductBranchConfig.create({ ...ids, price: Money.of("18000"), isAvailable: true });
        const { useCase, repository } = buildHarness({ current });

        const result = await useCase.execute({ ...ids, price: null, isAvailable: null });

        expect(result).toBeNull();
        expect(repository.delete).toHaveBeenCalledWith(current.id, TENANT_ID);
        expect(repository.save).not.toHaveBeenCalled();
    });
});
