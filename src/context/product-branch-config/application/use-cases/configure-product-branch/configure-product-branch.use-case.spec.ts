import { Money } from "@/shared";

import { ProductBranchConfig } from "../../../domain/product-branch-config.aggregate";
import { ConfigureProductBranchUseCase } from "./configure-product-branch.use-case";

const TENANT_ID = "550e8400-e29b-41d4-a716-446655440000";
const PRODUCT_ID = "7a1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const NORTH = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const SOUTH = "8e2d3b4c-5e6f-4a71-9b8c-0d1e2f3a4b5c";

const base = { tenantId: TENANT_ID, productId: PRODUCT_ID };

const buildHarness = (options: {
    current?: ProductBranchConfig[];
    productExists?: boolean;
    foreignBranch?: string;
} = {}) => {
    const repository = {
        findByProduct: jest.fn().mockResolvedValue(options.current ?? []),
        saveMany: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new ConfigureProductBranchUseCase(
        repository as never,
        { existsInTenant: jest.fn().mockResolvedValue(options.productExists ?? true) },
        { existsInTenant: jest.fn().mockImplementation(async (branchId: string) => branchId !== options.foreignBranch) },
    );

    return { useCase, repository };
};

const savedConfigs = (saveMany: jest.Mock): ProductBranchConfig[] => saveMany.mock.calls[0][0];

describe("ConfigureProductBranchUseCase", () => {
    it("rechaza un producto que no es del negocio", async () => {
        const { useCase, repository } = buildHarness({ productExists: false });

        await expect(useCase.execute({ ...base, branches: [{ branchId: NORTH, price: "1000" }] }))
            .rejects.toMatchObject({ code: "1400" });
        expect(repository.saveMany).not.toHaveBeenCalled();
    });

    it("rechaza la lista completa si una sucursal no es del negocio", async () => {
        const { useCase, repository } = buildHarness({ foreignBranch: SOUTH });

        await expect(useCase.execute({
            ...base,
            branches: [{ branchId: NORTH, price: "1000" }, { branchId: SOUTH, price: "2000" }],
        })).rejects.toMatchObject({ code: "1410" });
        expect(repository.saveMany).not.toHaveBeenCalled();
    });

    it("rechaza una sucursal repetida en la lista", async () => {
        const { useCase, repository } = buildHarness();

        await expect(useCase.execute({
            ...base,
            branches: [{ branchId: NORTH, price: "1000" }, { branchId: NORTH, isAvailable: false }],
        })).rejects.toMatchObject({ code: "1414" });
        expect(repository.saveMany).not.toHaveBeenCalled();
    });

    it("crea una sucursal y cambia otra en la misma petición", async () => {
        const existing = ProductBranchConfig.create({ ...base, branchId: SOUTH, price: Money.of("18000"), isAvailable: true });
        const { useCase, repository } = buildHarness({ current: [existing] });

        await useCase.execute({
            ...base,
            branches: [{ branchId: NORTH, price: "15000" }, { branchId: SOUTH, isAvailable: false }],
        });

        const [created, changed] = savedConfigs(repository.saveMany);
        expect(repository.saveMany).toHaveBeenCalledTimes(1);
        expect(created?.toPrimitives()).toMatchObject({ branchId: NORTH, price: "15000.00", isAvailable: null });
        expect(changed?.toPrimitives()).toMatchObject({ id: existing.id.value, price: "18000.00", isAvailable: false });
    });

    it("rechaza sin guardar nada si una entrada deja la sucursal sin precio ni estado", async () => {
        const existing = ProductBranchConfig.create({ ...base, branchId: SOUTH, price: Money.of("18000"), isAvailable: null });
        const { useCase, repository } = buildHarness({ current: [existing] });

        await expect(useCase.execute({
            ...base,
            branches: [{ branchId: NORTH, price: "15000" }, { branchId: SOUTH, price: null }],
        })).rejects.toMatchObject({ code: "1412" });
        expect(repository.saveMany).not.toHaveBeenCalled();
    });

    it("rechaza crear una sucursal con precio y estado en null", async () => {
        const { useCase, repository } = buildHarness();

        await expect(useCase.execute({ ...base, branches: [{ branchId: NORTH, price: null, isAvailable: null }] }))
            .rejects.toMatchObject({ code: "1412" });
        expect(repository.saveMany).not.toHaveBeenCalled();
    });
});
