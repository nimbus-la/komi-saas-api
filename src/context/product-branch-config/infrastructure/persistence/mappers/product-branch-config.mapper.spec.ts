import { Money } from "@/shared";

import { ProductBranchConfig } from "../../../domain/product-branch-config.aggregate";
import { ProductBranchConfigMapper } from "./product-branch-config.mapper";

const baseParams = {
    tenantId: "tenant-1",
    productId: "product-1",
    branchId: "branch-1",
};

describe("ProductBranchConfigMapper", () => {
    it("conserva una configuración con precio al ir y volver de la fila", () => {
        const config = ProductBranchConfig.create({ ...baseParams, price: Money.of("15000"), isAvailable: null });

        const row = ProductBranchConfigMapper.toPersistence(config);

        expect(row).toMatchObject({ priceAmount: "15000.00", priceCurrency: "COP", isAvailable: null });
        expect(ProductBranchConfigMapper.toDomain(row).toPrimitives()).toEqual(config.toPrimitives());
    });

    it("conserva una configuración solo con estado al ir y volver de la fila", () => {
        const config = ProductBranchConfig.create({ ...baseParams, price: null, isAvailable: false });

        const row = ProductBranchConfigMapper.toPersistence(config);

        expect(row).toMatchObject({ priceAmount: null, priceCurrency: null, isAvailable: false });
        expect(ProductBranchConfigMapper.toDomain(row).toPrimitives()).toEqual(config.toPrimitives());
    });
});
