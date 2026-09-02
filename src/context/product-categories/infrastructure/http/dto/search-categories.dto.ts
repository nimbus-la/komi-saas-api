import { Transform, Type } from "class-transformer";
import {
    IsBoolean,
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
} from "class-validator";

import { VALIDATION_DEFAULTS } from "@/shared";

export class SearchCategoriesDto {
    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsUUID()
    id?: string;

    // Llega como string en el query: sin este Transform, "false" sería truthy.
    @IsOptional()
    @Transform(({ value }) =>
        value === undefined ? undefined : value === "true" || value === true,
    )
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsDateString()
    createdAt?: string;

    @IsOptional()
    @IsDateString()
    updatedAt?: string;

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
