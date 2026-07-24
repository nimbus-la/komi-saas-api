import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductCategoryMapper } from "../mappers/products-categories-mapper";
import { ProductCategoryEntity } from "../models/product-category.entity";

import {
    ProductCategory,
    ProductCategoryRepository,
} from "../../../domain";

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
        await this.categoryRepository.save(entity);
    }

    async findAll(): Promise<ProductCategory[]> {
        const rows = await this.categoryRepository.find();
        return rows.map(ProductCategoryMapper.toDomain);
    }

    async findById(id: string): Promise<ProductCategory | null> {
        const row = await this.categoryRepository.findOne({ where: { id } });
        return row ? ProductCategoryMapper.toDomain(row) : null;
    }

    async existsByName(
        name: string,
        tenantId: string,
    ): Promise<boolean> {
        const count = await this.categoryRepository.count({
            where: {
                name,
                tenantId,
            },
        });
        return count > 0;
    }

    async update(category: ProductCategory): Promise<void> {
        const entity = ProductCategoryMapper.toEntity(category);

        await this.categoryRepository.update(entity.id, entity);
    }

    async search(params: {
        tenantId: string;

        text?: string;
        id?: string;
        estado?: boolean;
        createdAt?: string;
        updatedAt?: string;
    }): Promise<ProductCategory[]> {

        const query = this.categoryRepository
            .createQueryBuilder("category");

        if (params.tenantId) {
            query.andWhere("category.tenantId = :tenantId", {
                tenantId: params.tenantId,
            });
        }

        if (params.id) {
            query.andWhere(
                "category.id = :id",
                {
                    id: params.id,
                },
            );
        }


        // Nombre o descripción
        if (params.text) {
            query.andWhere(
                `(LOWER(category.name) LIKE LOWER(:text)
            OR LOWER(category.description) LIKE LOWER(:text))`,
                {
                    text: `%${params.text}%`,
                },
            );
        }


        // Estado
        if (params.estado !== undefined) {
            query.andWhere(
                "category.estado = :estado",
                {
                    estado: params.estado,
                },
            );
        }


        // Fecha creación
        if (params.createdAt) {
            query.andWhere(
                "DATE(category.createdAt) = :createdAt",
                {
                    createdAt: params.createdAt,
                },
            );
        }


        // Fecha edición
        if (params.updatedAt) {
            query.andWhere(
                "DATE(category.updatedAt) = :updatedAt",
                {
                    updatedAt: params.updatedAt,
                },
            );
        }


        const rows = await query.getMany();

        return rows.map(ProductCategoryMapper.toDomain);
    }
}