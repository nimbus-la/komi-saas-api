import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from "class-validator";

export class CreateCategoryDto {

    @IsUUID()
    tenantId!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}