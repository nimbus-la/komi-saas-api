import { Injectable } from "@nestjs/common";

import { InventoryItemChecker } from "@/context/products/application/ports/inventory-item-checker";
import { InventoryItemEntity } from "@/context/inventory";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class InventoryItemCheckerAdapter
    implements InventoryItemChecker {

    constructor(
        @InjectRepository(InventoryItemEntity)
        private readonly repository: Repository<InventoryItemEntity>,
    ) { }

    async existsForTenant(
        tenantId: string,
        inventoryItemId: string,
    ): Promise<boolean> {

        const item = await this.repository.findOne({
            where: {
                id: inventoryItemId,
                tenantId,
            },
        });

        return !!item;
    }
}