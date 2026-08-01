import { IsUUID, IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCategoryDto {
    @IsUUID()
    tenantId!: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    estado?: boolean;
}