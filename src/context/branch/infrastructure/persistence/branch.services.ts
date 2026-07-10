import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import {
    BranchAggregate,
    BranchId,
    BranchName,
    BranchRepository,
    BranchResponse,
} from "../../domain";

import { BranchEntity } from "./branch.entity";

@Injectable()
export class BranchService implements BranchRepository {

    constructor(
        @InjectRepository(BranchEntity)
        private readonly branchRepository: Repository<BranchEntity>,
    ) {}

    public async save(branch: BranchAggregate): Promise<void> {
        const primitives = branch.toPrimitives();

        const row = this.branchRepository.create({
            id: primitives.id,
            tenantId: primitives.tenantId,
            name: primitives.name,
            address: primitives.address,
            phone: primitives.phone,
            city: primitives.city,
            department: primitives.department,
            isActive: primitives.isActive,
        });

        await this.branchRepository.save(row);
    }

    public async searchById(id: BranchId): Promise<BranchResponse | null> {
        const row = await this.branchRepository.findOne({
            where: {
                id: id.value,
            },
        });

        if (!row) {
            return null;
        }

        return {
            id: row.id,
            tenantId: row.tenantId,
            name: row.name,
            address: row.address,
            phone: row.phone,
            city: row.city,
            department: row.department,
            created_at: row.createdAt,
            updated_at: row.updatedAt,
            isActive: row.isActive,
        };
    }

    public async searchAggregateById(
        id: BranchId
    ): Promise<BranchAggregate | null> {

        const row = await this.branchRepository.findOne({
            where: {
                id: id.value,
            },
        });

        if (!row) {
            return null;
        }

        return BranchAggregate.fromPrimitives({
            id: row.id,
            tenantId: row.tenantId,
            name: row.name,
            address: row.address,
            phone: row.phone,
            city: row.city,
            department: row.department,
            isActive: row.isActive,
        });
    }

    public async existsByName(name: BranchName): Promise<boolean> {
        const count = await this.branchRepository
            .createQueryBuilder("branch")
            .where("branch.name ILIKE :name", { name: name.value })
            .getCount();

        return count > 0;
    }

    public async searchAll(): Promise<BranchResponse[]> {
        const rows = await this.branchRepository.find();

        return rows.map((row) => ({
            id: row.id,
            tenantId: row.tenantId,
            name: row.name,
            address: row.address,
            phone: row.phone,
            city: row.city,
            department: row.department,
            created_at: row.createdAt,
            updated_at: row.updatedAt,
            isActive: row.isActive,
        }));
    }

    public async update(branch: BranchAggregate): Promise<void> {
        const primitives = branch.toPrimitives();

        await this.branchRepository.update(
            { id: primitives.id },
            {
                name: primitives.name,
                address: primitives.address,
                phone: primitives.phone,
                city: primitives.city,
                department: primitives.department,
                isActive: primitives.isActive,
            }
        );
    }
}