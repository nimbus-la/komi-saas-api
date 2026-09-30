import { Money } from "@/shared";

import { ProductBranchConfig } from "./product-branch-config.aggregate";

const baseParams = {
    tenantId: "tenant-1",
    productId: "product-1",
    branchId: "branch-1",
};

describe("ProductBranchConfig", () => {
    it("rechaza un precio en 0", () => {
        expect(() => ProductBranchConfig.create({ ...baseParams, price: Money.of("0"), isAvailable: null }))
            .toThrow(expect.objectContaining({ code: "1411" }));
    });

    it("rechaza una configuración que no sobrescribe nada", () => {
        expect(() => ProductBranchConfig.create({ ...baseParams, price: null, isAvailable: null }))
            .toThrow(expect.objectContaining({ code: "1412" }));
    });

    it("queda vacía cuando se devuelven precio y estado al producto", () => {
        const config = ProductBranchConfig.create({ ...baseParams, price: Money.of("12000"), isAvailable: false });

        config.changePrice(null);
        config.changeAvailability(null);

        expect(config.isEmpty()).toBe(true);
    });

    it("se reconstruye igual desde sus primitivos", () => {
        const config = ProductBranchConfig.create({ ...baseParams, price: Money.of("12000", "USD"), isAvailable: true });

        const primitives = config.toPrimitives();

        expect(primitives).toMatchObject({ price: "12000.00", currency: "USD", isAvailable: true });
        expect(ProductBranchConfig.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
    });
});
