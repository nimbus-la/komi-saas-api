import { IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class UpdateTenantDto {

    @IsString()
    @IsNotEmpty()
    @Length(2, 30)
    name!: string;

    @IsString()
    @Length(0, 225)
    description!: string;

    @IsString()
    @Length(3, 100)
    slug!: string;

    @IsString()
    @Matches(/^[0-9]+$/, {
        message: 'El NIT debe contener solo números',
    })
    nit!: string;
}