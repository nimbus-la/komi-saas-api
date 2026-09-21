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

    /**
     * Llega como string en el query: sin este Transform, "false" sería truthy.
     *
     * Solo traduce "true" y "false"; cualquier otra cosa pasa tal cual para que
     * `@IsBoolean()` la rechace con un 400. Si se tradujera todo lo demás a
     * `false`, un `?productStatus=activo` filtraría por inactivos en silencio.
     */
    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true" || value === "false") {
            return value === "true";
        }

        return value as unknown;
    })
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
