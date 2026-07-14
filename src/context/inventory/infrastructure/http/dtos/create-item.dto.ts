import { IsBoolean, IsString, IsUUID, MinLength } from "class-validator";


export class CreateItemDto {

    @IsUUID()
    tenantId!: string;

    @IsString()
    @MinLength(2)
    name!: string;


    @IsString()
    unitOfMeasure!: string;


    @IsBoolean()
    isPerishable!: boolean;
};
