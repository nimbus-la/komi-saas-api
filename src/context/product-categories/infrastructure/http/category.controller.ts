import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryService } from "../persistence/services/category.service";

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
            status: "SUCCESS",
            code: "0000",
            statusCode: 200,
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
            status: "SUCCESS",
            code: "0000",
            statusCode: 200,
            message: 'Categoría actualizada con éxito',
        };
    }
    @Get()
async search(
    @Query("text") text?: string,
    @Query("id") id?: string,
    @Query("estado") estado?: string,
) {
    const params: {
        text?: string;
        id?: string;
        estado?: boolean;
    } = {};

    if (text) {
        params.text = text;
    }

    if (id) {
        params.id = id;
    }

    if (estado !== undefined) {
        params.estado = estado === "true";
    }

    return this.service.search(params);
}
}