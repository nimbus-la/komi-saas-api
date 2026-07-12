import { EventPublisher, Money, Quantity } from "@/shared";
import { BranchNotFoundException, InventoryItemId, InventoryItemNotFoundException, InventoryItemRepository } from "../../../domain";
import { BranchChecker } from "../../ports/branch-checker";
import { DEFAULT_CURRENCY } from "@/context/inventory/domain/common/constants.common";
import { InventoryBatchExpirationDate } from "@/context/inventory/domain/entities/inventory-batch/value-objects/inventory-batch-expiration.value-object";



export interface ReceiveStockParams {
    itemId: string;
    branchId: string;
    quantityReceived: string;
    totalCostAmount: string;
    expirationDate?: string | null;
    receivedAt?: string;
};


export class ReceiveStockUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
        private readonly branchCheker: BranchChecker,
        private readonly eventPublisher: EventPublisher
    ) { };

    public async execute(params: ReceiveStockParams) {
        if (!(await this.branchCheker.exists(params.branchId))) {
            throw new BranchNotFoundException(params.branchId);
        };

        const item = await this.repository.findById(InventoryItemId.create(params.itemId));

        if (item === null) {
            throw new InventoryItemNotFoundException(params.itemId);
        };

        const quantityReceived = Quantity.of(params.quantityReceived);
        const unitCost = Money.of(params.totalCostAmount, DEFAULT_CURRENCY).divide(quantityReceived.getValue());

        item.recivedBatch({
            branchId: params.branchId,
            quantityReceived,
            unitCost,
            expirationDate: params.expirationDate
                ? InventoryBatchExpirationDate.create(params.expirationDate)
                : null,
            ...(params.receivedAt ? { receivedAt: new Date(params.receivedAt) } : {}),
        });

        await this.repository.save(item);

        await this.eventPublisher.publish(item.getDomainEvents());
        item.clearDomainEvents();
    };
};