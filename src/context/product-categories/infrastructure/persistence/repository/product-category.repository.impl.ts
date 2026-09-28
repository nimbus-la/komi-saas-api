import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository, SelectQueryBuilder } from "typeorm";

import { Paginated, Pagination } from "@/interfaces";

import { ProductCategoryMapper } from "../mappers/product-category.mapper";
import { ProductCategoryEntity } from "../models/product-category.entity";

import {
    ProductCategory,
    ProductCategoryAlreadyExistsException,
    CategoryWithProductCount,
    ProductCategoryRepository,
    SearchCategoriesFilters,
} from "../../../domain";

/** Violación de restricción única en PostgreSQL. */
const UNIQUE_VIOLATION = "23505";

@Injectable()
export class ProductCategoryRepositoryImpl extends ProductCategoryRepository {
    constructor(
        @InjectRepository(ProductCategoryEntity)
        private readonly categoryRepository: Repository<ProductCategoryEntity>,
    ) {
        super();
    }

    async save(category: ProductCategory): Promise<void> {
        const entity = ProductCategoryMapper.toEntity(category);

        try {
            await this.categoryRepository.insert(entity);
        } catch (error) {
            // El chequeo previo de nombre no es atómico: dos peticiones
            // simultáneas lo pasan y el índice único es quien resuelve.
            if (
                error instanceof QueryFailedError &&
                (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
            ) {
                throw new ProductCategoryAlreadyExistsException(entity.name);
            }

            throw error;
        }
    }

    async findById(
        id: string,
        tenantId: string,
    ): Promise<ProductCategory | null> {
        const row = await this.categoryRepository.findOne({
            where: { id, tenantId },
        });

        return row ? ProductCategoryMapper.toDomain(row) : null;
    }

    async existsByName(
        name: string,
        tenantId: string,
        excludeId?: string,
    ): Promise<boolean> {
        const query = this.categoryRepository
            .createQueryBuilder("category")
            .where("category.tenantId = :tenantId", { tenantId })
            .andWhere("LOWER(category.name) = LOWER(:name)", { name });

        if (excludeId) {
            query.andWhere("category.id != :excludeId", { excludeId });
        }

        const count = await query.getCount();

        return count > 0;
    }

    async update(category: ProductCategory): Promise<void> {
        const primitives = category.toPrimitives();

        try {
            // Update dirigido: el id, el tenant y la fecha de creación son inmutables,
            // y el criterio incluye el tenant para no tocar filas de otro negocio.
            await this.categoryRepository.update(
                {
                    id: primitives.id,
                    tenantId: primitives.tenantId,
                },
                {
                    name: primitives.name,
                    description: primitives.description ?? null,
                    isActive: primitives.isActive,
                },
            );
        } catch (error) {
            // Igual que en save: el chequeo previo de nombre no es atómico y
            // dos renombrados simultáneos los resuelve el índice único.
            if (
                error instanceof QueryFailedError &&
                (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
            ) {
                throw new ProductCategoryAlreadyExistsException(primitives.name);
            }

            throw error;
        }
    }

    async search(
        filters: SearchCategoriesFilters,
        pagination: Pagination,
    ): Promise<Paginated<CategoryWithProductCount>> {
        // La tabla product pertenece al módulo de productos, por eso se cuenta
        // con una subconsulta en SQL y no con una relación de TypeORM.
        const query: SelectQueryBuilder<ProductCategoryEntity> =
            this.categoryRepository
                .createQueryBuilder("category")
                .addSelect(
                    `(SELECT COUNT(*)::int FROM product p
                      WHERE p.product_category_id = category.id
                        AND p.tenant_id = :tenantId)`,
                    "product_count",
                )
                .where("category.tenantId = :tenantId", {
                    tenantId: filters.tenantId,
                });

        if (filters.id) {
            query.andWhere("category.id = :id", { id: filters.id });
        }

        // Nombre o descripción
        if (filters.text) {
            query.andWhere(
                `(LOWER(category.name) LIKE LOWER(:text)
                  OR LOWER(category.description) LIKE LOWER(:text))`,
                { text: `%${filters.text}%` },
            );
        }

        // Estado
        if (filters.isActive !== undefined) {
            query.andWhere("category.isActive = :isActive", {
                isActive: filters.isActive,
            });
        }

        // Fecha creación
        if (filters.createdAt) {
            query.andWhere("DATE(category.createdAt) = :createdAt", {
                createdAt: filters.createdAt,
            });
        }

        // Fecha edición
        if (filters.updatedAt) {
            query.andWhere("DATE(category.updatedAt) = :updatedAt", {
                updatedAt: filters.updatedAt,
            });
        }

        query
            .orderBy("category.createdAt", "DESC")
            .skip((pagination.pageNumber - 1) * pagination.pageSize)
            .take(pagination.pageSize);

        const [{ entities, raw }, total] = await Promise.all([
            query.getRawAndEntities<{ category_id: string; product_count: number }>(),
            query.getCount(),
        ]);

        const countById = new Map(
            raw.map((row) => [row.category_id, row.product_count]),
        );

        return {
            rows: entities.map((entity) => ({
                category: ProductCategoryMapper.toDomain(entity),
                productCount: countById.get(entity.id) ?? 0,
            })),
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
            total,
        };
    }
}
