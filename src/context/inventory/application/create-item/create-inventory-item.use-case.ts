
import { Money } from "@/shared";

import { InventoryItem } from "../../domain/inventory-item.aggregate";
import { InventoryItemRepository } from "../../domain/inventory-item.repository";
import { InventoryItemNameAlreadyExistsException, TenantNotFoundException } from "../../domain/exceptions/inventory-item.exceptions";
import { InventoryItemName } from "../../domain/value-objects/inventory-item-name.value-object";
import { InventoryItemUnit } from "../../domain/value-objects/inventory-item-unit.value-object";
import { InventoryItemSku } from "../../domain/value-objects/inventory-item-sku.value-object";
import { TenantChecker } from "../ports/tenant-checker";

export interface CreateInventoryItemParams {
    tenantId: string;
    name: string;
    unitOfMeasure: string;
    costAmount: string;
    costCurrency?: string;
    isPerishable: boolean;
};


export class CreateInventoryItemUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
        private readonly tenantCheker: TenantChecker,
    ) { };

    public async execute(params: CreateInventoryItemParams): Promise<void> {
        if (!(await this.tenantCheker.exists(params.tenantId))) {
            throw new TenantNotFoundException(params.tenantId);
        };

        const name = InventoryItemName.create(params.name);

        if (await this.repository.existsByName(name)) {
            throw new InventoryItemNameAlreadyExistsException(params.name);
        };

        const skuNumber = await this.repository.nextSkuSequence();
        const sku = InventoryItemSku.fromNumber(skuNumber);

        const item = InventoryItem.create({
            tenantId: params.tenantId,
            sku,
            name,
            unitOfMeasure: InventoryItemUnit.create(params.unitOfMeasure),
            costAmount: Money.of(params.costAmount, params.costCurrency ?? 'COP'),
            isPerishable: params.isPerishable,
            createdAt: new Date()
        });

        await this.repository.save(item);
    };
};