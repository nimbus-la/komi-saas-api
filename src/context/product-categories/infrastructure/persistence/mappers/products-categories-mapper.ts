import { ProductCategory } from "@/context/product-categories/domain";
import { ProductCategoryEntity } from "@/context/product-categories/infrastructure/persistence/models/product-category.entity";

export class ProductCategoryMapper {
    static toEntity(category: ProductCategory): ProductCategoryEntity {
        return {
            id: category.id,
            name: category.name,
            description: category.description ?? null,
            estado: category.isActive,
        } as ProductCategoryEntity;
    }

    static toDomain(entity: ProductCategoryEntity): ProductCategory {
        return new ProductCategory(
            entity.id,
            entity.name,
            entity.description ?? undefined,
            entity.estado,
        );
    }
}