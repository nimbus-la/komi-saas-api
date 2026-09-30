import { ProductBranchConfig } from "../../../domain/product-branch-config.aggregate";
import { RemoveProductBranchConfigUseCase } from "./remove-product-branch-config.use-case";

const ids = {
    tenantId: "550e8400-e29b-41d4-a716-446655440000",
    productId: "7a1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b",
    branchId: "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b",
};

const buildHarness = (current: ProductBranchConfig | null) => {
    const repository = {
        findByProductAndBranch: jest.fn().mockResolvedValue(current),
        delete: jest.fn().mockResolvedValue(undefined),
    };

    return { useCase: new RemoveProductBranchConfigUseCase(repository as never), repository };
};

describe("RemoveProductBranchConfigUseCase", () => {
    it("responde 1413 si la sucursal no tiene configuración", async () => {
        const { useCase, repository } = buildHarness(null);

        await expect(useCase.execute(ids)).rejects.toMatchObject({ code: "1413" });
        expect(repository.delete).not.toHaveBeenCalled();
    });

    it("borra la configuración filtrando por negocio", async () => {
        const current = ProductBranchConfig.create({ ...ids, price: null, isAvailable: false });
        const { useCase, repository } = buildHarness(current);

        await useCase.execute(ids);

        expect(repository.delete).toHaveBeenCalledWith(current.id, ids.tenantId);
    });
});
