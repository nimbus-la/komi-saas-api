import { Injectable } from "@nestjs/common";
import { UpdateCategoryDto } from "../../http/dto/update-category.dto";
import { CreateCategoryDto } from "../../http/dto/create-category.dto";
import { CreateCategoryUseCase, SearchCategoriesUseCase, UpdateCategoryUseCase } from "@/context/product-categories/application";
import { ProductCategoryresponse } from "../mappers/products-categories-mapper";


@Injectable()
export class CategoryService {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly updateCategoryUseCase: UpdateCategoryUseCase,
        private readonly searchCategoriesUseCase: SearchCategoriesUseCase,

    ) { }

    async create(dto: CreateCategoryDto) {
        const category = await this.createCategoryUseCase.execute({
            tenantId: dto.tenantId,
            name: dto.name,
            description: dto.description,
        });

        return ProductCategoryresponse.toResponse(category);
    }
    async update(id: string, dto: UpdateCategoryDto) {
        return this.updateCategoryUseCase.execute(
            id,
            {
                ...dto,
            }
        );
    }
    async search(params: {
        tenantId: string;
        text?: string;
        id?: string;
        estado?: boolean;
    }) {
        return this.searchCategoriesUseCase.execute(params);
    }
}