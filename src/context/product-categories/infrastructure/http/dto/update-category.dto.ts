import {
    IsBoolean,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from "class-validator";

import { VALIDATION_DEFAULTS } from "@/shared";

export class UpdateCategoryDto {
    @IsUUID()
    categoryId!: string;

    @IsOptional()
    @IsString()
    @MinLength(VALIDATION_DEFAULTS.NAME.MIN_LENGTH)
    @MaxLength(VALIDATION_DEFAULTS.NAME.MAX_LENGTH)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
