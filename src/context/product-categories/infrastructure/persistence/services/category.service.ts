import { Injectable } from "@nestjs/common";
import { UpdateCategoryDto } from "../../http/dto/update-category.dto";
import { CreateCategoryDto } from "../../http/dto/create-category.dto";
import { CreateCategoryUseCase, SearchCategoriesUseCase, UpdateCategoryUseCase } from "@/context/product-categories/application";


@Injectable()
export class CategoryService {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly updateCategoryUseCase: UpdateCategoryUseCase,
        private readonly searchCategoriesUseCase: SearchCategoriesUseCase,

    ) { }

    async create(dto: CreateCategoryDto) {
        return this.createCategoryUseCase.execute({
            tenantId: dto.tenantId,
            name: dto.name,
            description: dto.description,
            estado: dto.estado,
        });
    }
    async update(id: string, dto: UpdateCategoryDto) {
        await this.updateCategoryUseCase.execute(id, dto);
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