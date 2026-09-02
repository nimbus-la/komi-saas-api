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
    @MinLength(VALIDATION_DEFAULTS.NAME.MIN_LENGTH)
    @MaxLength(VALIDATION_DEFAULTS.NAME.MAX_LENGTH)
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;
}
