import { Controller, Get, Query } from "@nestjs/common";

import { type AuthenticatedUser, CurrentUser } from "@/auth/infrastructure";

import { SearchMovementsUseCase } from "../../application";
import { SearchInventoryMovementsDto } from "./dtos/search-movement.dto";


@Controller('inventory/movements')
export class InventoryMovementController {
    constructor(
        private readonly searchMovements: SearchMovementsUseCase
    ) { };

    @Get()
    public async search(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: SearchInventoryMovementsDto
    ) {
        const { pageNumber, pageSize, ...filters } = query;

        return this.searchMovements.execute(
            { ...filters, tenantId: user.tenantId },
            { pageNumber, pageSize }
        );
    };
};