import { Body, Controller, Get, Patch, Post, Query } from "@nestjs/common";

import { ResponseMessage } from "@/infrastructure";
import { CurrentUser } from "@/auth/infrastructure/decorators";
import type { AuthenticatedUser } from "@/auth/infrastructure/types";

import { UpdateBranchDto } from "./dto/update-branch.dto";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { SearchBranchesDto } from "./dto/search-branches.dto";
import { CreateBranchUseCase, SearchBranchesUseCase, UpdateBranchUseCase } from "../../application";


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
        private readonly updateBranch: UpdateBranchUseCase,
        private readonly searchBranches: SearchBranchesUseCase,
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
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: SearchBranchesDto,
    ) {
        const { pageNumber, pageSize, ...filters } = query;

        return await this.searchBranches.execute(
            { ...filters, tenantId: user.tenantId },
            { pageNumber, pageSize },
        );
    }


    @Patch("/update")
    @ResponseMessage('Sucursal actualizada exitosamente.')
    public async update(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateBranchDto,
    ): Promise<void> {
        await this.updateBranch.execute(dto.branchId, user.tenantId, dto);
    }


    // TODO: Eliminar sucursal. Hace falta un estado nuevo en el dominio (is_deleted)
    // en lugar de borrar la fila, porque otras tablas la referencian.
};
