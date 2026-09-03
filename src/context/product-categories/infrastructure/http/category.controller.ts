import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Query,
} from "@nestjs/common";

import { type AuthenticatedUser, CurrentUser } from "@/auth/infrastructure";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { SearchCategoriesDto } from "./dto/search-categories.dto";
import {
    CreateCategoryUseCase,
    SearchCategoriesUseCase,
    UpdateCategoryUseCase,
} from "../../application";

@Controller("products/categories")
export class CategoryController {
    constructor(
        private readonly createCategory: CreateCategoryUseCase,
        private readonly updateCategory: UpdateCategoryUseCase,
        private readonly searchCategories: SearchCategoriesUseCase,
    ) { }


    @Post()
    public async create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateCategoryDto
    ): Promise<void> {
        await this.createCategory.execute({ ...dto, tenantId: user.tenantId });
    }


    @Patch("update")
    public async update(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateCategoryDto,
    ): Promise<void> {
        const { categoryId, ...dtoWithoutCategoryId } = dto;

        await this.updateCategory.execute(categoryId, { ...dtoWithoutCategoryId, tenantId: user.tenantId });
    }


    @Get()
    public async list(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: SearchCategoriesDto
    ) {
        const { pageNumber, pageSize, ...filters } = query;

        return this.searchCategories.execute({ ...filters, tenantId: user.tenantId }, { pageNumber, pageSize });
    }
}
