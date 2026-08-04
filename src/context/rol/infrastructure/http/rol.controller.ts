import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";
import { Controller, Get, Param, UseFilters, UseInterceptors } from "@nestjs/common";
import { SearchAllRolUseCase, SearchRolUseCase } from "../../application";

@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller("rol")
export class RolController {

    constructor(
        private readonly searchRolById: SearchRolUseCase,
        private readonly searchAllRoles: SearchAllRolUseCase,
    ) {}

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
}