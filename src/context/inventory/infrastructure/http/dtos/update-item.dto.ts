import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateItemDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    unitOfMeasure?: string;

    @IsOptional()
    @IsBoolean()
    isPerishable?: boolean;
};