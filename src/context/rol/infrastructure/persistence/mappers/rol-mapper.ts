import { RolResponse } from "@/context/rol/domain/types/rol-response";
import { RolEntity } from "../models/rol.entity";
import { RolAggregate } from "@/context/rol/domain";

export class RolMapper {

    public static toResponse(entity: RolEntity): RolResponse {
        return {
            id: entity.id,
            code: entity.code,
            name: entity.name,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
        };
    }

    public static toAggregate(entity: RolEntity): RolAggregate {
        return RolAggregate.fromPrimitives({
            id: entity.id,
            code: entity.code,
            name: entity.name,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
};