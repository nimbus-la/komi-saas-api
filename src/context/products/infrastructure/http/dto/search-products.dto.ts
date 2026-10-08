import { Type } from "class-transformer";
import {
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
} from "class-validator";

import { ENTITY_STATUSES_USER_SET, EntityStatus, VALIDATION_DEFAULTS } from "@/shared";

export class SearchProductsDto {
    @IsOptional()
    @IsUUID()
    productId?: string;

    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsUUID()
    productCategoryId?: string;

    /**
     * Sucursal en la que se evalúa el stock de los insumos de cada receta.
     * También define el precio y el estado de cada producto según su
     * configuración en esa sucursal; sin configuración salen los generales.
     */
    @IsOptional()
    @IsUUID()
    branchId?: string;

    @IsOptional()
    @IsIn(ENTITY_STATUSES_USER_SET)
    status?: EntityStatus;

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
}
