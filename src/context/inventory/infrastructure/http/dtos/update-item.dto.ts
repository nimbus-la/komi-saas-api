import { IsBoolean, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class UpdateItemDto {
    @IsUUID()
    itemId!: string;

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