import { ProductCategory } from "@/context/product-categories/domain";
import { ProductCategoryEntity } from "@/context/product-categories/infrastructure/persistence/models/product-category.entity";

export class ProductCategoryMapper {
    static toEntity(category: ProductCategory): ProductCategoryEntity {
        const primitives = category.toPrimitives();

        return {
            id: primitives.id,
            tenantId: primitives.tenantId,
            name: primitives.name,
            description: primitives.description ?? null,
            estado: primitives.isActive,
        } as ProductCategoryEntity;
    }

    static toDomain(entity: ProductCategoryEntity): ProductCategory {
        return ProductCategory.fromPrimitives({
            id: entity.id,
            tenantId: entity.tenantId,
            name: entity.name,
            description: entity.description ?? undefined,
            isActive: entity.estado,
        });
    }
}