import {
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from "class-validator";

import { VALIDATION_DEFAULTS } from "@/shared";

export class CreateCategoryDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(VALIDATION_DEFAULTS.PRODUCTS_CATEGORY.MIN_LENGTH_NAME)
    @MaxLength(VALIDATION_DEFAULTS.PRODUCTS_CATEGORY.MAX_LENGTH_NAME)
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;
}
