import { Body, Controller, Delete, Get, Param, Patch, Post, UseFilters, UseInterceptors } from "@nestjs/common";

import { AllExceptionsFilter, ResponseInterceptor, ResponseMessage } from "@/infrastructure";
import { CreateTenantUseCase, DeleteTenantUseCases, SearchAllTenantsUseCase, SearchTenantUseCase, UpdateTenantUseCase } from "../../application";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";

@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller("tenant")
export class TenantController {
    constructor (
        private readonly createTenant: CreateTenantUseCase,
        private readonly searchTenantById: SearchTenantUseCase,
        private readonly searchAllTenants: SearchAllTenantsUseCase,
        private readonly updateTenant: UpdateTenantUseCase,
        private readonly deleteTenant: DeleteTenantUseCases
    ) { }

    @Post()
    @ResponseMessage('Tenant creado exitosamente.')
    public async create(
        @Body() dto: CreateTenantDto
    ) {
        await this.createTenant.execute({
            accountId: dto.accountId,
            name: dto.name,
            description: dto.description,
            slug: dto.slug,
            nit: dto.nit
        });
    };

    @Get()
    public async findAll() {
        return await this.searchAllTenants.execute();
    }

    @Get(':id')
    public async findOne(
        @Param('id') id: string,
    ) { 
        return await this.searchTenantById.execute(id);
    };

    @Patch(':id')
    @ResponseMessage('Tenant actualizado exitosamente.')
    public async update(
        @Param('id') id:string,
        @Body()dto: UpdateTenantDto,
    ) {
        await this.updateTenant.execute(id, {
            name: dto.name,
            description: dto.description,
            slug: dto.slug,
            nit: dto.nit
        })
    };

    @Delete(':id')
    @ResponseMessage('Tenant desactivado exitosamente.')
    public async delete(
        @Param('id') id:string
    ) {
        await this.deleteTenant.execute(id);
    }

};