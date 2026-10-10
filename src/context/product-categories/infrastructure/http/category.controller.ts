import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Post,
    Query,
} from "@nestjs/common";

import { Paginated } from "@/interfaces";
import { ResponseMessage } from "@/infrastructure";
import { type AuthenticatedUser, CurrentUser } from "@/auth/infrastructure";

import { CategoryListItem } from "../../domain";
import { CreateCategoryUseCase, DeleteCategoryUseCase, SearchCategoriesUseCase, UpdateCategoryUseCase } from "../../application";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { SearchCategoriesDto } from "./dto/search-categories.dto";
import { DeleteCategoryDto } from "./dto/delete-category.dto";


@Controller("products/categories")
export class CategoryController {
    private readonly searchCategories: SearchCategoriesUseCase;
    private readonly createCategory: CreateCategoryUseCase;
    private readonly updateCategory: UpdateCategoryUseCase;
    private readonly deleteCategory: DeleteCategoryUseCase;


    constructor(
        searchCategories: SearchCategoriesUseCase,
        createCategory: CreateCategoryUseCase,
        updateCategory: UpdateCategoryUseCase,
        deleteCategory: DeleteCategoryUseCase
    ) {
        this.searchCategories = searchCategories;
        this.createCategory = createCategory;
        this.updateCategory = updateCategory;
        this.deleteCategory = deleteCategory;
    }


    @Get()
    public async list(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: SearchCategoriesDto
    ): Promise<Paginated<CategoryListItem>> {
        return this.searchCategories.execute({ ...query, tenantId: user.tenantId });
    }


    @Post()
    @ResponseMessage("Categoría creada exitosamente.")
    public async create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateCategoryDto
    ): Promise<void> {
        await this.createCategory.execute({ ...dto, tenantId: user.tenantId });
    }


    @Patch("update")
    @ResponseMessage("Categoría actualizada exitosamente.")
    public async update(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateCategoryDto,
    ): Promise<void> {
        await this.updateCategory.execute({ ...dto, tenantId: user.tenantId });
    }


    @Delete("delete")
    @ResponseMessage("Categoría eliminada exitosamente.")
    public async delete(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: DeleteCategoryDto,
    ): Promise<void> {
        await this.deleteCategory.execute({ ...dto, tenantId: user.tenantId });
    }
}
