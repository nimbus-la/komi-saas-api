import { ProductCategory } from "../../../domain";
import { ProductCategoryEntity } from "../models/product-category.entity";

export class ProductCategoryMapper {
    static toEntity(category: ProductCategory): ProductCategoryEntity {
        const primitives = category.toPrimitives();

        const entity = new ProductCategoryEntity();

        entity.id = primitives.id;
        entity.tenantId = primitives.tenantId;
        entity.name = primitives.name;
        entity.description = primitives.description ?? null;
        entity.isActive = primitives.isActive;
        entity.createdAt = primitives.createdAt;
        entity.updatedAt = primitives.updatedAt;

        return entity;
    }

    static toDomain(entity: ProductCategoryEntity): ProductCategory {
        return ProductCategory.fromPrimitives({
            id: entity.id,
            tenantId: entity.tenantId,
            name: entity.name,
            description: entity.description ?? undefined,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
}
