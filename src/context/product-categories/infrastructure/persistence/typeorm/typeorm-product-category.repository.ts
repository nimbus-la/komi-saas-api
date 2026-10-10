import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository, SelectQueryBuilder } from "typeorm";

import { Paginated } from "@/interfaces";
import { EntityStatus, VISIBLE_ENTITY_STATUSES } from "@/shared";

import { ProductCategory, ProductCategoryRepository, SearchCategoriesFilters, CategoryListItem } from "../../../domain";
import { ProductCategoryMapper } from "../mappers/product-category.mapper";
import { ProductCategoryModel } from "../models/product-category.model";


@Injectable()
export class TypeOrmProductCategoryRepository extends ProductCategoryRepository {
    private readonly categoryRepository: Repository<ProductCategoryModel>;


    constructor(
        @InjectRepository(ProductCategoryModel)
        categoryRepository: Repository<ProductCategoryModel>,
    ) {
        super()
        this.categoryRepository = categoryRepository
    };


    public async save(category: ProductCategory): Promise<void> {
        const model = ProductCategoryMapper.toModel(category);

        await this.categoryRepository.insert(model);
    }


    public async findById(categoryId: string, tenantId: string): Promise<ProductCategory | null> {
        const row = await this.categoryRepository.findOne({
            where: {
                categoryId,
                tenantId,
                status: Not(EntityStatus.Deleted)
            },
        });

        return row ? ProductCategoryMapper.toDomain(row) : null;
    }


    public async isNameTaken(category: ProductCategory): Promise<boolean> {
        const { id: categoryId, tenantId, name } = category.toPrimitives();

        // Busca otra categoría del negocio con el mismo nombre, sin contar la propia ni las eliminadas
        return await this.categoryRepository
            .createQueryBuilder("category")
            .where("category.tenantId = :tenantId", { tenantId })
            .andWhere("LOWER(category.name) = LOWER(:name)", { name })
            .andWhere("category.categoryId != :categoryId", { categoryId })
            .andWhere("category.status <> :deleted", { deleted: EntityStatus.Deleted })
            .getExists();
    }


    public async update(category: ProductCategory): Promise<void> {
        const { id: categoryId, tenantId, name, description, status } = category.toPrimitives();

        await this.categoryRepository.update(
            { categoryId, tenantId },
            { name, description: description ?? null, status },
        );
    }


    public async countProducts(categoryId: string, tenantId: string): Promise<number> {
        const row = await this.baseListQuery(tenantId)
            .andWhere("category.categoryId = :categoryId", { categoryId })
            .getRawOne<{ product_count: number }>();

        return row?.product_count ?? 0;
    }


    async search(params: SearchCategoriesFilters): Promise<Paginated<CategoryListItem>> {
        const { tenantId, pageNumber, pageSize } = params;

        const query = this.baseListQuery(tenantId);
        this.applyFilters(query, params);

        query
            .orderBy("category.createdAt", "DESC")
            .skip((pageNumber - 1) * pageSize)
            .take(pageSize);

        const [{ entities, raw }, total] = await Promise.all([
            query.getRawAndEntities<{ row_id: string; product_count: number }>(),
            query.getCount(),
        ]);

        const countById = new Map(
            raw.map((row) => [row.row_id, row.product_count]),
        );

        return {
            rows: entities.map((model) => ({
                ...ProductCategoryMapper.toDomain(model).toPrimitives(),
                productCount: countById.get(model.categoryId) ?? 0,
            })),
            pageNumber,
            pageSize,
            total,
        };
    }


    /** Categorías del negocio con su conteo de productos visibles, en una sola consulta. */
    private baseListQuery(tenantId: string): SelectQueryBuilder<ProductCategoryModel> {
        return this.categoryRepository
            .createQueryBuilder("category")
            .addSelect("category.categoryId", "row_id")
            .addSelect(
                `(SELECT COUNT(*)::int FROM product p
                WHERE p.product_category_id = category.category_id
                AND p.tenant_id = :tenantId
                AND p.product_status IN (:...visibleStatuses))`,
                "product_count",
            )
            .where("category.tenantId = :tenantId", { tenantId })
            .setParameter("visibleStatuses", [...VISIBLE_ENTITY_STATUSES])
    }


    /** Agrega solo los filtros que llegaron. */
    private applyFilters(query: SelectQueryBuilder<ProductCategoryModel>, params: SearchCategoriesFilters): void {
        const { categoryId, text, status, createdAt, updatedAt } = params;

        if (categoryId) {
            query.andWhere("category.categoryId = :categoryId", { categoryId });
        }

        // Busca en el nombre o en la descripción
        if (text) {
            query.andWhere(
                `(LOWER(category.name) LIKE LOWER(:text) OR 
                LOWER(category.description) LIKE LOWER(:text))`,
                { text: `%${text}%` },
            );
        }

        // Sin filtro salen activas e inactivas, las eliminadas nunca
        if (status !== undefined) {
            query.andWhere("category.status = :status", { status });
        } else {
            query.andWhere("category.status IN (:...visibleStatuses)");
        }

        if (createdAt) {
            query.andWhere("DATE(category.createdAt) = :createdAt", { createdAt });
        }

        if (updatedAt) {
            query.andWhere("DATE(category.updatedAt) = :updatedAt", { updatedAt });
        }
    }
}
