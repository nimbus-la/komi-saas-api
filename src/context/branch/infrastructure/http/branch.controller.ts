import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { ResponseMessage } from "@/infrastructure";
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
@Controller("branch")
export class BranchController {
    constructor(
        private readonly createBranch: CreateBranchUseCase,
        private readonly searchBranchById: SearchBranchUseCase,
        private readonly updateBranch: UpdateBranchUseCase,
        private readonly deleteBranch: DeleteBranchUseCase,
        private readonly searchBranchesByTenant: SearchBranchesByTenantUseCase,
    ) { }


    @Post()
    @ResponseMessage('Sucursal creada exitosamente.')
    public async create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateBranchDto
    ) {
        await this.createBranch.execute({ ...dto, tenantId: user.tenantId });
    };


    @Get()
    public async findAll(
        @CurrentUser() user: AuthenticatedUser
    ) {
        return await this.searchBranchesByTenant.execute(user.tenantId);
    }


    @Get(':id')
    public async findOne(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string
    ) {
        return await this.searchBranchById.execute(id, user.tenantId);
    };


    @Patch("/update")
    public async update(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateBranchDto,
    ): Promise<void> {
        await this.updateBranch.execute(dto.branchId, user.tenantId, dto);
    }


    @Patch('/status')
    @ResponseMessage('Estado de la sucursal actualizado exitosamente.')
    public async updateStatus(
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: { branchId: string }
    ) {
        // TODO: Cambiar el nombre de la función a toggleStatus o algo así, porque no es solo desactivar, sino que puede reactivar también.
        await this.deleteBranch.execute(body.branchId, user.tenantId);
    }


    @Delete('/delete')
    public async removeBranch() {
        // TODO: Implementar la función de eliminar sucursal. agregando un nuevo estado al dominio (is_deleted) y un nuevo endpoint en el controller. Eliminar la sucursal de la base de datos no es una buena práctica, ya que puede haber registros relacionados con esa sucursal en otras tablas.
    }
};
