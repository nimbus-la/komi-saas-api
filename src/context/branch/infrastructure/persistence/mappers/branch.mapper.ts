import { BranchAggregate, BranchResponse } from "@/context/branch/domain";
import { BranchEntity } from "../models/branch.entity";

export class BranchMapper {

    public static toResponse(entity: BranchEntity): BranchResponse {
        return {
            id: entity.id,
            tenantId: entity.tenantId,
            name: entity.name,
            address: entity.address,
            phone: entity.phone,
            city: entity.city,
            department: entity.department,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            isActive: entity.isActive,
        };
    }

    public static toAggregate(entity: BranchEntity): BranchAggregate {
        return BranchAggregate.fromPrimitives({
            id: entity.id,
            tenantId: entity.tenantId,
            name: entity.name,
            address: entity.address,
            phone: entity.phone,
            city: entity.city,
            department: entity.department,
            isActive: entity.isActive,
            isDeleted: entity.isDeleted,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
}