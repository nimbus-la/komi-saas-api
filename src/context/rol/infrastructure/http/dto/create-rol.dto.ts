import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateRolDto {

    @IsString()
    @MinLength(2)
    @MaxLength(20)
    code!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name!: string;
}