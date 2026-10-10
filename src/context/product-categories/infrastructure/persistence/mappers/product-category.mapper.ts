import { ProductCategory } from "../../../domain";

import { ProductCategoryModel } from "../models/product-category.model";


/**
 * Traduce entre el agregado ProductCategory y la fila de la tabla product_category.
 * Existe para que el dominio no dependa de TypeORM, así que solo lo usa el repositorio.
 */
export class ProductCategoryMapper {
    /**
     * Convierte la categoría en el modelo que se guarda en la base.
     * La descripción vacía se guarda como null, que es como la columna la espera.
     */
    public static toModel(category: ProductCategory): ProductCategoryModel {
        const primitives = category.toPrimitives();

        const model = new ProductCategoryModel();

        model.categoryId = primitives.id;
        model.tenantId = primitives.tenantId;
        model.name = primitives.name;
        model.description = primitives.description ?? null;
        model.status = primitives.status;
        model.createdAt = primitives.createdAt;
        model.updatedAt = primitives.updatedAt;

        return model;
    }


    /**
     * Reconstruye la categoría a partir de la fila leída de la base.
     * El null de la descripción vuelve a ser undefined, que es lo que usa el dominio.
     */
    public static toDomain(entity: ProductCategoryModel): ProductCategory {
        return ProductCategory.fromPrimitives({
            id: entity.categoryId,
            tenantId: entity.tenantId,
            name: entity.name,
            description: entity.description ?? undefined,
            status: entity.status,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
}
