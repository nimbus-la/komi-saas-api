import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";
import { Body, Controller, Get, Param, Patch, Post, UseFilters, UseInterceptors } from "@nestjs/common";
import { CreateRolUseCase, SearchAllRolUseCase, SearchRolUseCase, UpdateRolUseCase } from "../../application";
import { CreateRolDto } from "./dto/create-rol.dto";
import { UpdateRolDto } from "./dto/update-rol.dto";

@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller("rol")
export class RolController {

    constructor(
        private readonly createRol: CreateRolUseCase,
        private readonly searchRolById: SearchRolUseCase,
        private readonly searchAllRoles: SearchAllRolUseCase,
        private readonly updateRol: UpdateRolUseCase,
    ) {}

    @Post()
    public async create(
        @Body() dto: CreateRolDto,
    ): Promise<void> {

        await this.createRol.execute({
            code: dto.code,
            name: dto.name,
        });
    }

    @Get()
    public async findAll() {
        return await this.searchAllRoles.execute();
    }

    @Get(":id")
    public async findOne(
        @Param("id") id: string,
    ) {
        return await this.searchRolById.execute(id);
    }

    @Patch(":id")
    public async update(
        @Param("id") id: string,
        @Body() dto: UpdateRolDto,
    ): Promise<void> {

        await this.updateRol.execute(id, dto);
    }
}