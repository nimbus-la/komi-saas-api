import { Injectable } from "@nestjs/common";

import { CreateCategoryDto } from "../http/dto/create-category.dto";
import { CreateCategoryUseCase } from "../../application/create-category/create-category.use-case";

@Injectable()
export class CategoryService {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
    ) { }

    async create(dto: CreateCategoryDto) {
        return this.createCategoryUseCase.execute({
            name: dto.name,
            description: dto.description,
            estado: dto.estado,
        });
    }
}