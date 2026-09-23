import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

import { VALIDATION_DEFAULTS } from "@/shared";

export class SearchBranchesDto {
    @IsOptional()
    @IsUUID()
    branchId?: string;

    /** Busca en nombre, dirección, teléfono, ciudad y departamento. */
    @IsOptional()
    @IsString()
    text?: string;

    /**
     * Llega como string en el query: sin este Transform, "false" sería truthy.
     * Solo traduce "true" y "false"; cualquier otro valor lo rechaza @IsBoolean().
     */
    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true" || value === "false") {
            return value === "true";
        }

        return value as unknown;
    })
    @IsBoolean()
    branchStatus?: boolean;

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
