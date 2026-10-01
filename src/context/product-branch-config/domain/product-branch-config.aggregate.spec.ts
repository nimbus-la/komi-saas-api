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
            .toThrow(expect.objectContaining({ code: "1016" }));
    });

    it("rechaza una configuración que no sobrescribe nada", () => {
        expect(() => ProductBranchConfig.create({ ...baseParams, price: null, isAvailable: null }))
            .toThrow(expect.objectContaining({ code: "1421" }));
    });

    it("cambia solo el campo enviado", () => {
        const config = ProductBranchConfig.create({ ...baseParams, price: Money.of("12000"), isAvailable: false });

        config.change({ price: null });

        expect(config.toPrimitives()).toMatchObject({ price: null, currency: null, isAvailable: false });
    });

    it("no se deja vacía al devolver precio y estado al producto", () => {
        const config = ProductBranchConfig.create({ ...baseParams, price: Money.of("12000"), isAvailable: null });

        expect(() => config.change({ price: null }))
            .toThrow(expect.objectContaining({ code: "1421" }));
        expect(config.toPrimitives()).toMatchObject({ price: "12000.00" });
    });

    it("se reconstruye igual desde sus primitivos", () => {
        const config = ProductBranchConfig.create({ ...baseParams, price: Money.of("12000", "USD"), isAvailable: true });

        const primitives = config.toPrimitives();

        expect(primitives).toMatchObject({ price: "12000.00", currency: "USD", isAvailable: true });
        expect(ProductBranchConfig.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
    });
});
