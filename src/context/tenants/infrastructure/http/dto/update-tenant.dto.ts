import { IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator";

export class UpdateTenantDto {

    @IsString()
    @IsNotEmpty()
    @Length(2, 30)
    @IsOptional()
    name?: string;

    @IsString()
    @Length(0, 225)
    @IsOptional()
    description?: string;

    @IsString()
    @Length(3, 100)
    @IsOptional()
    slug?: string;

    @IsString()
    @Matches(/^[A-Za-z0-9./-]+$/, {
        message: "El NIT solo puede contener letras, números, punto (.), guion (-) y barra (/)",
    })
    @IsOptional()
    nit?: string;
}