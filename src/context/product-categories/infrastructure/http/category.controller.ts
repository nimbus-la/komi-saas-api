import { Body, Controller, Get, Param, Patch, Post, Query, UseFilters, UseInterceptors } from "@nestjs/common";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryService } from "../persistence/services/category.service";
import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";

@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)

@Controller('products/categories')
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
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const params: {
            tenantId: string;
            text?: string;
            id?: string;
            estado?: boolean;
            page?: number;
            limit?: number;
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

        if (page !== undefined) {
            params.page = Number(page);
        }

        if (limit !== undefined) {
            params.limit = Number(limit);
        }

        return this.service.search(params);
    }
}