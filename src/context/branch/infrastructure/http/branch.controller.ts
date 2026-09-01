import { Body, Controller, Delete, Get, Param, Patch, Post, UseFilters, UseInterceptors } from "@nestjs/common";

import { AllExceptionsFilter, ResponseInterceptor, ResponseMessage } from "@/infrastructure";
import { CurrentUser } from "@/auth/infrastructure/decorators";
import type { AuthenticatedUser } from "@/auth/infrastructure/types";

import { UpdateBranchDto } from "./dto/update-branch.dto";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { CreateBranchUseCase, DeleteBranchUseCase, SearchBranchesByTenantUseCase, SearchBranchUseCase, UpdateBranchUseCase } from "../../application";


/**
 * Sucursales del negocio de quien pregunta.
 *
 * El tenantId sale del token con @CurrentUser, nunca de la ruta ni del body: es
 * lo único que el cliente no puede elegir. Antes las rutas por :id buscaban la
 * sucursal solo por su identificador, así que con el id de una sucursal ajena se
 * la podía leer, editar y desactivar desde cualquier negocio.
 */
@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller("branch")
export class BranchController {

    constructor(
        private readonly createBranch: CreateBranchUseCase,
        private readonly searchBranchById: SearchBranchUseCase,
        private readonly updateBranch: UpdateBranchUseCase,
        private readonly deleteBranch: DeleteBranchUseCase,
        private readonly searchBranchesByTenant: SearchBranchesByTenantUseCase,
    ) {}

    @Post()
    @ResponseMessage('Sucursal creada exitosamente.')
    public async create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateBranchDto
    ) {
        await this.createBranch.execute({
            tenantId: user.tenantId,
            name: dto.name,
            address: dto.address,
            phone: dto.phone,
            city: dto.city,
            department: dto.department,
        });
    };


    /**
     * Antes devolvía las sucursales de TODOS los negocios. Ahora son las de quien
     * pregunta, que es lo único que este endpoint podía querer decir.
     */
    @Get()
    public async findAll(@CurrentUser() user: AuthenticatedUser) {
        return await this.searchBranchesByTenant.execute(user.tenantId);
    }


    /**
     * Queda igual que findAll ahora que ese está acotado. Se conserva para no
     * romper a quien ya la esté llamando; el guard de alcance se encarga de que
     * el tenantId de la ruta sea el del token.
     */
    @Get("tenant/:tenantId")
    public async findByTenant(@Param("tenantId") tenantId: string) {
        return await this.searchBranchesByTenant.execute(tenantId);
    }


    @Get(':id')
    public async findOne(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        return await this.searchBranchById.execute(id, user.tenantId);
    };


    @Patch(":id")
    public async update(
        @CurrentUser() user: AuthenticatedUser,
        @Param("id") id: string,
        @Body() dto: UpdateBranchDto,
    ): Promise<void> {
        await this.updateBranch.execute(id, user.tenantId, dto);
    }


    @Delete(':id')
    @ResponseMessage('Sucursal desactivada exitosamente.')
    public async delete(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        await this.deleteBranch.execute(id, user.tenantId);
    }

};
