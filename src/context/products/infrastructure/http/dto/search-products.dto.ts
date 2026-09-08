import { Transform, Type } from "class-transformer";
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
} from "class-validator";

import { VALIDATION_DEFAULTS } from "@/shared";

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

    // Llega como string en el query: sin este Transform, "false" sería truthy.
    @IsOptional()
    @Transform(({ value }) =>
        value === undefined ? undefined : value === "true" || value === true,
    )
    @IsBoolean()
    productStatus?: boolean;

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
