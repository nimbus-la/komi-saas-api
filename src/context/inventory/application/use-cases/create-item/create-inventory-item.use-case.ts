
import { InventoryItem, InventoryItemName, InventoryItemNameAlreadyExistsException, InventoryItemRepository, InventoryItemSku, InventoryItemUnit, TenantNotFoundException } from "../../../domain";
import { CreateInventoryItemParams } from "../../dtos/inventory-item.params";
import { TenantChecker } from "../../ports/tenant-checker";


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

        if (await this.repository.existsByName(name, params.tenantId)) {
            throw new InventoryItemNameAlreadyExistsException(params.name);
        };

        const skuNumber = await this.repository.nextSkuSequence();
        const sku = InventoryItemSku.fromNumber(skuNumber);

        const item = InventoryItem.create({
            tenantId: params.tenantId,
            sku,
            name,
            unitOfMeasure: InventoryItemUnit.create(params.unitOfMeasure),
            isPerishable: params.isPerishable,
            createdAt: new Date()
        });

        await this.repository.save(item);
    };
};