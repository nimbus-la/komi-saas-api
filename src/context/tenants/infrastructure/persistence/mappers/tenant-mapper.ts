import { TenantAggregate, TenantResponse } from "@/context/tenants/domain";
import { TenantEntity } from "../models/tenant.entity";

export class TenantMapper {

    public static toResponse(entity: TenantEntity): TenantResponse {
        return {
            id: entity.id,
            //accountId: entity.accountId,
            name: entity.name,
            description: entity.description,
            slug: entity.slug,
            nit: entity.nit,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
            isActive: entity.isActive,
        };
    }

    public static toAggregate(entity: TenantEntity): TenantAggregate {
        return TenantAggregate.fromPrimitives({
            id: entity.id,
            //accountId: entity.accountId,
            name: entity.name,
            description: entity.description,
            slug: entity.slug,
            nit: entity.nit,
            isActive: entity.isActive,
            isDeleted: entity.isDeleted,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }

    public static toResponseList(
        entities: TenantEntity[],
    ): TenantResponse[] {
        return entities.map(TenantMapper.toResponse);
    }
}