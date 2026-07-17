import { IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";

export class CreateTenantDto {
    @IsUUID()
    accountId!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(30)
    name!: string;

    @IsString()
    @MaxLength(225)
    description!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(100)
    slug!: string;

    @IsString()
    @Matches(/^[A-Za-z0-9./-]+$/, {
        message: "El NIT solo puede contener letras, números, punto (.), guion (-) y barra (/)",
    })
    nit!: string;
};