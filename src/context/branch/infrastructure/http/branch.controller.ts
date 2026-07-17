
import { Body, Controller, Delete, Get, Param, Patch, Post, UseFilters, UseInterceptors } from "@nestjs/common";

import { AllExceptionsFilter, ResponseInterceptor, ResponseMessage } from "@/infrastructure";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { CreateBranchUseCase, DeleteBranchUseCase, SearchAllBranchUseCase, SearchBranchesByTenantUseCase, SearchBranchUseCase, UpdateBranchUseCase } from "../../application";

@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller("branch")
export class BranchController {

    constructor(
        private readonly createBranch: CreateBranchUseCase,
        private readonly searchBranchById: SearchBranchUseCase,
        private readonly searchAllBranches: SearchAllBranchUseCase,
        private readonly updateBranch: UpdateBranchUseCase,
        private readonly deleteBranch: DeleteBranchUseCase,
        private readonly searchBranchesByTenant: SearchBranchesByTenantUseCase,
    ) {}

    @Post()
    @ResponseMessage('Sucursal creada exitosamente.')
    public async create(
        @Body() dto: CreateBranchDto
    ) {
        await this.createBranch.execute({
            tenantId: dto.tenantId,
            name: dto.name,
            address: dto.address,
            phone: dto.phone,
            city: dto.city,
            department: dto.department,
        });
    };


    @Get()
    public async findAll() {
        return await this.searchAllBranches.execute();
    }

     @Get("tenant/:tenantId")
    public async findByTenant(
        @Param("tenantId") tenantId: string,
    ) {
        return await this.searchBranchesByTenant.execute(tenantId);
    }

    @Get(':id')
    public async findOne(
        @Param('id') id: string
    ) {
        return await this.searchBranchById.execute(id);
    };


    @Patch(":id")
    public async update(
        @Param("id") id: string,
        @Body() dto: UpdateBranchDto,
    ): Promise<void> {
        await this.updateBranch.execute(id, dto);
    }


    @Delete(':id')
    @ResponseMessage('Sucursal desactivada exitosamente.')
    public async delete(
        @Param('id') id: string
    ) {
        await this.deleteBranch.execute(id);
    }

};