import { Body, Controller, Delete, Get, Patch, Post, Query } from "@nestjs/common";

import { ResponseMessage } from "@/infrastructure";
import { CurrentUser } from "@/auth/infrastructure/decorators";
import type { AuthenticatedUser } from "@/auth/infrastructure/types";

import { UpdateBranchDto } from "./dto/update-branch.dto";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { SearchBranchesDto } from "./dto/search-branches.dto";
import { DeleteBranchDto } from "./dto/delete-branch.dto";
import { CreateBranchUseCase, DeleteBranchUseCase, SearchBranchesUseCase, UpdateBranchUseCase } from "../../application";


/**
 * Sucursales del negocio de quien pregunta.
 *
 * El tenantId sale del token con @CurrentUser, nunca de la ruta, el query ni el
 * body: es lo único que el cliente no puede elegir.
 */
@Controller("branch")
export class BranchController {
    constructor(
        private readonly createBranch: CreateBranchUseCase,
        private readonly updateBranch: UpdateBranchUseCase,
        private readonly searchBranches: SearchBranchesUseCase,
        private readonly deleteBranch: DeleteBranchUseCase,
    ) { }


    @Post()
    @ResponseMessage('Sucursal creada exitosamente.')
    public async create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateBranchDto
    ) {
        await this.createBranch.execute({ ...dto, tenantId: user.tenantId });
    }


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


    @Delete("delete")
    @ResponseMessage('Sucursal eliminada exitosamente.')
    public async delete(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: DeleteBranchDto,
    ): Promise<void> {
        await this.deleteBranch.execute(query.branchId, user.tenantId);
    }
}
