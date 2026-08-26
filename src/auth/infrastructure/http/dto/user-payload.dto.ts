import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UserLoginPayloadDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    tenantSlug!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    username!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    password!: string;
}