import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { InventoryMovement, InventoryMovementRepository } from "../../../domain";
import { InventoryMovementModel } from "../models/inventory-movements.models";
import { InventoryMovementPersistenceMapper } from "../mappers/inventory-movement.persistence-mapper";


@Injectable()
export class TypeOrmInventoryMovementRepository implements InventoryMovementRepository {
    constructor(
        @InjectRepository(InventoryMovementModel)
        private readonly movements: Repository<InventoryMovementModel>
    ) { };


    public async save(movement: InventoryMovement): Promise<void> {
        await this.movements.insert(InventoryMovementPersistenceMapper.toPersistence(movement));
    };
};