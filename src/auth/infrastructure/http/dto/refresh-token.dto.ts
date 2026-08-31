import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RefreshTokenPayloadDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    refreshToken!: string;
}