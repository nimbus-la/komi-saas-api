import {
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
    Matches,
} from "class-validator";

export class CreateBranchDto {

    @IsUUID()
    tenantId!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(30)
    name!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(100)
    address!: string;

    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, {
        message: 'El teléfono contiene caracteres no válidos',
    })
    @MinLength(7)
    @MaxLength(15)
    phone!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    city!: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    department!: string;
}