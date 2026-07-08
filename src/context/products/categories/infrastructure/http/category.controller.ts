import { Body, Controller, Post } from "@nestjs/common";

import { CategoryService } from "../persistence/category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Controller("categories")
export class CategoryController {
    constructor(
        private readonly service: CategoryService,
    ) { }

    @Post()
    async create(
        @Body() dto: CreateCategoryDto,
    ) {
        await this.service.create(dto);

        return {
            statusCode: 201,
            message: "Categoría creada con éxito",
        };
    }
}