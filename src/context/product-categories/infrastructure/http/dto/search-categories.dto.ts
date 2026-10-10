import { Type } from "class-transformer";
import {
    IsDateString,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
} from "class-validator";

import { ENTITY_STATUSES_USER_SET, EntityStatus, VALIDATION_DEFAULTS } from "@/shared";


export class SearchCategoriesDto {
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsIn(ENTITY_STATUSES_USER_SET)
    status?: EntityStatus;

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
