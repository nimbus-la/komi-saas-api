import { IsBoolean, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UpdateItemDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @Matches(/^\d+(\.\d{1,2})?$/, { message: 'costAmount debe ser numérico (hasta 2 decimales).' })
    costAmount?: string;

    @IsOptional()
    @IsString()
    costCurrency?: string;

    @IsOptional()
    @IsString()
    unitOfMeasure?: string;

    @IsOptional()
    @IsBoolean()
    isPerishable?: boolean;
};