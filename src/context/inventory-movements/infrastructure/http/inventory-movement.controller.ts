import { Controller, Get, Query, UseFilters, UseInterceptors } from "@nestjs/common";

import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";
import { SearchMovementsUseCase } from "../../application";
import { SearchInventoryMovementsDto } from "./dtos/search-movement.dto";


@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller('inventory/movements')
export class InventoryMovementController {
    constructor(
        private readonly searchMovements: SearchMovementsUseCase
    ) { };

    @Get()
    public async search(
        @Query() query: SearchInventoryMovementsDto
    ) {
        const { pageNumber, pageSize, ...filters } = query;

        return this.searchMovements.execute(
            filters,
            { pageNumber, pageSize }
        );
    };
};