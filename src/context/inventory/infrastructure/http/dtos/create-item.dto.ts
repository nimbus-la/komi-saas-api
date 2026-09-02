import { IsBoolean, IsString, MinLength } from "class-validator";


export class CreateItemDto {
    @IsString()
    @MinLength(2)
    name!: string;


    @IsString()
    unitOfMeasure!: string;


    @IsBoolean()
    isPerishable!: boolean;
};
