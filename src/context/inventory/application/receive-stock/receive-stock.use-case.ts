import { Money, Quantity } from "@/shared";
import { BranchNotFoundException, InventoryItemNotFoundException } from "../../domain/exceptions/inventory-item.exceptions";
import { InventoryItemRepository } from "../../domain/inventory-item.repository";
import { InventoryItemId } from "../../domain/value-objects/inventory-item-id.value-object";
import { InventoryBatchExpirationDate } from "../../domain/entities/inventory-batch/value-objects/inventory-batch-expiration.value-object";
import { BranchChecker } from "../ports/branch-checker";


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
        const currency = item.toPrimitives().costCurrency;
        const unitCost = Money.of(params.totalCostAmount, currency).divide(quantityReceived.getValue());

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
    };
};