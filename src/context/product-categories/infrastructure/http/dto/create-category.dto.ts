import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from "class-validator";

export class CreateCategoryDto {

    @IsUUID()
    tenantId!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(120)
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;
}
