import { IsOptional, IsString, MaxLength, MinLength, } from "class-validator";

export class UpdateRolDto {

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(20)
    code?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name?: string;
}