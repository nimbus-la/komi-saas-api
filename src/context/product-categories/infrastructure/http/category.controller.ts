import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseFilters,
    UseInterceptors,
} from "@nestjs/common";

import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { SearchCategoriesDto } from "./dto/search-categories.dto";
import {
    CreateCategoryUseCase,
    SearchCategoriesUseCase,
    UpdateCategoryUseCase,
} from "../../application";

@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)

@Controller("products/categories")
export class CategoryController {
    constructor(
        private readonly createCategory: CreateCategoryUseCase,
        private readonly updateCategory: UpdateCategoryUseCase,
        private readonly searchCategories: SearchCategoriesUseCase,
    ) { }

    @Post()
    public async create(@Body() dto: CreateCategoryDto): Promise<void> {
        await this.createCategory.execute(dto);
    }

    @Patch(':id')
    public async update(
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDto,
    ): Promise<void> {
        await this.updateCategory.execute(id, dto);
    }

    @Get()
    public async list(@Query() query: SearchCategoriesDto) {
        const { pageNumber, pageSize, ...filters } = query;

        return this.searchCategories.execute(filters, { pageNumber, pageSize });
    }
}
