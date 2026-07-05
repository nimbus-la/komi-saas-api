import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";


export class CreateItemDto {

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
