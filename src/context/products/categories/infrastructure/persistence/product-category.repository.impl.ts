import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import {
    ProductCategory,
    ProductCategoryRepository,
} from "../../domain";

import { ProductCategoryEntity } from "../../domain/product-category.entity";

@Injectable()
export class ProductCategoryRepositoryImpl extends ProductCategoryRepository {
    constructor(
        @InjectRepository(ProductCategoryEntity)
        private readonly categoryRepository: Repository<ProductCategoryEntity>,
    ) {
        super();
    }

    async save(category: ProductCategory): Promise<void> {
        console.log("Entró al save");

        const row = this.categoryRepository.create({
            id: category.id,
            name: category.name,
            description: category.description ?? null,
            estado: category.isActive,
        });

        console.log(row);

        const saved = await this.categoryRepository.save(row);

        console.log(saved);
    }

    async findAll(): Promise<ProductCategory[]> {
        const rows = await this.categoryRepository.find();

        return rows.map(
            (row) =>
                new ProductCategory(
                    row.id,
                    row.name,
                    row.description ?? undefined,
                    row.estado,
                ),
        );
    }

    async findById(id: string): Promise<ProductCategory | null> {
        const row = await this.categoryRepository.findOne({
            where: { id },
        });

        if (!row) {
            return null;
        }

        return new ProductCategory(
            row.id,
            row.name,
            row.description ?? undefined,
            row.estado,
        );
    }

    async existsByName(name: string): Promise<boolean> {
        const count = await this.categoryRepository.count({
            where: { name },
        });

        return count > 0;
    }
}