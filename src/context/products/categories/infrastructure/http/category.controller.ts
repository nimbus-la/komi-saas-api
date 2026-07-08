import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";

import { CategoryService } from "../persistence/category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

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
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDto,
    ) {
        await this.service.update(id, dto);

        return {
            statusCode: 200,
            message: 'Categoría actualizada con éxito',
        };
    }
    @Get()
    async search(
        @Query("estado") estado?: string,
    ) {
        const params: { estado?: boolean } = {};

        if (estado !== undefined) {
            params.estado = estado === "true";
        }

        return this.service.search(params);
    }
}