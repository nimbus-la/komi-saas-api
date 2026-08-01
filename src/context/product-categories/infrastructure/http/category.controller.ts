import { Body, Controller, Get, Param, Patch, Post, Query, UseFilters, UseInterceptors } from "@nestjs/common";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryService } from "../persistence/services/category.service";
import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";

@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)

@Controller("categories")
export class CategoryController {
    constructor(
        private readonly service: CategoryService,
    ) { }

    @Post()
    async create(@Body() dto: CreateCategoryDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDto
    ) {
        const category = await this.service.update(id, dto);

        return {
            data: category.toPrimitives(),
        };
    }

    @Get()
    async search(
        @Query("tenantId") tenantId: string,
        @Query("text") text?: string,
        @Query("id") id?: string,
        @Query("estado") estado?: string,
    ) {
        const params: {
            tenantId: string;
            text?: string;
            id?: string;
            estado?: boolean;
        } = {
            tenantId,
        };

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