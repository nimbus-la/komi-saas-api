import { ProductBranchConfig } from "../../../domain/product-branch-config.aggregate";
import { RemoveProductBranchConfigUseCase } from "./remove-product-branch-config.use-case";

const TENANT_ID = "550e8400-e29b-41d4-a716-446655440000";
const PRODUCT_ID = "7a1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const NORTH = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const SOUTH = "8e2d3b4c-5e6f-4a71-9b8c-0d1e2f3a4b5c";

const base = { tenantId: TENANT_ID, productId: PRODUCT_ID };

const configFor = (branchId: string) =>
    ProductBranchConfig.create({ ...base, branchId, price: null, isAvailable: false });

const buildHarness = (current: ProductBranchConfig[]) => {
    const repository = {
        findByProduct: jest.fn().mockResolvedValue(current),
        deleteMany: jest.fn().mockResolvedValue(undefined),
    };

    return { useCase: new RemoveProductBranchConfigUseCase(repository as never), repository };
};

describe("RemoveProductBranchConfigUseCase", () => {
    it("borra varias sucursales con una sola llamada y filtrando por negocio", async () => {
        const north = configFor(NORTH);
        const south = configFor(SOUTH);
        const { useCase, repository } = buildHarness([north, south]);

        await useCase.execute({ ...base, branchIds: [NORTH, SOUTH] });

        expect(repository.deleteMany).toHaveBeenCalledTimes(1);
        expect(repository.deleteMany).toHaveBeenCalledWith([north.id, south.id], TENANT_ID);
    });

    it("no borra ninguna si una sucursal no tiene configuración", async () => {
        const { useCase, repository } = buildHarness([configFor(NORTH)]);

        await expect(useCase.execute({ ...base, branchIds: [NORTH, SOUTH] }))
            .rejects.toMatchObject({ code: "1413" });
        expect(repository.deleteMany).not.toHaveBeenCalled();
    });

    it("rechaza una sucursal repetida en la lista", async () => {
        const { useCase, repository } = buildHarness([configFor(NORTH)]);

        await expect(useCase.execute({ ...base, branchIds: [NORTH, NORTH] }))
            .rejects.toMatchObject({ code: "1414" });
        expect(repository.deleteMany).not.toHaveBeenCalled();
    });
});
