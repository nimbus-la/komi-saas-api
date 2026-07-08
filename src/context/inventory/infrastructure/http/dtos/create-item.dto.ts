import { IsBoolean, IsOptional, IsString, IsUUID, MinLength } from "class-validator";


export class CreateItemDto {

    @IsUUID()
    tenantId!: string;

    @IsString()
    @MinLength(2)
    name!: string;


    @IsString()
    unitOfMeasure!: string;


    @IsString()
    costAmount!: string;


    @IsOptional()
    @IsString()
    costCurrency?: string;


    @IsBoolean()
    isPerishable!: boolean;
};
