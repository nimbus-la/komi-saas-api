import { Type } from "class-transformer";
import { IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";

import { VALIDATION_DEFAULTS } from "@/shared";


/**
 * Lotes de un item. Pagina igual que el listado de items: el parametro se llama
 * pageNumber en los dos, no page en uno y pageNumber en el otro.
 */
export class SearchItemBatchesDto {
    @IsUUID()
    itemId!: string;

    @IsOptional()
    @IsUUID()
    branchId?: string;

    @Type(() => Number)
    @IsInt()
    @Min(VALIDATION_DEFAULTS.PAGINATION.MIN_VALUE)
    @IsOptional()
    pageNumber = VALIDATION_DEFAULTS.PAGINATION.PAGE_NUMBER;

    @Type(() => Number)
    @IsInt()
    @Min(VALIDATION_DEFAULTS.PAGINATION.MIN_VALUE)
    @Max(VALIDATION_DEFAULTS.PAGINATION.MAX_PAGE_SIZE)
    @IsOptional()
    pageSize = VALIDATION_DEFAULTS.PAGINATION.PAGE_SIZE;
};
