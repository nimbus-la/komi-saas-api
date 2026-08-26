import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UserLoginPayloadDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    tenantSlug!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    username!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    password!: string;
}