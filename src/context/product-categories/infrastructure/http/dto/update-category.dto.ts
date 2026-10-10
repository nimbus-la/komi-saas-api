import {
    IsIn,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from "class-validator";

import { ENTITY_STATUSES_USER_SET, EntityStatus, VALIDATION_DEFAULTS } from "@/shared";


export class UpdateCategoryDto {
    @IsUUID()
    categoryId!: string;

    @IsOptional()
    @IsString()
    @MinLength(VALIDATION_DEFAULTS.PRODUCTS_CATEGORY.MIN_LENGTH_NAME)
    @MaxLength(VALIDATION_DEFAULTS.PRODUCTS_CATEGORY.MAX_LENGTH_NAME)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(VALIDATION_DEFAULTS.PRODUCTS_CATEGORY.MAX_LENGTH_DESCRIPTION)
    description?: string;

    @IsOptional()
    @IsIn(ENTITY_STATUSES_USER_SET)
    status?: EntityStatus;
}
