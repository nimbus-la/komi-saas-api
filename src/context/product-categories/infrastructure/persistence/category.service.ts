import { Injectable } from "@nestjs/common";

import { CreateCategoryDto } from "../http/dto/create-category.dto";
import { CreateCategoryUseCase } from "../../application/create-category/create-category.use-case";
import { UpdateCategoryUseCase } from "../../application/update-category/update-category.use-case";
import { UpdateCategoryDto } from "../http/dto/update-category.dto";
import { SearchCategoriesUseCase } from "../../application/search-categories/search-categories.use-case";

@Injectable()
export class CategoryService {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly updateCategoryUseCase: UpdateCategoryUseCase,
        private readonly searchCategoriesUseCase: SearchCategoriesUseCase,

    ) { }

    async create(dto: CreateCategoryDto) {
        return this.createCategoryUseCase.execute({
            name: dto.name,
            description: dto.description,
            estado: dto.estado,
        });
    }
    async update(id: string, dto: UpdateCategoryDto) {
        await this.updateCategoryUseCase.execute(id, dto);
    }
    async search(params: { estado?: boolean }) {
        return this.searchCategoriesUseCase.execute(params);
    }
}