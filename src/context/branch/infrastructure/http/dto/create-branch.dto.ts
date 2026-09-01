import {
    IsString,
    MaxLength,
    MinLength,
    Matches,
} from "class-validator";

/**
 * El tenantId ya no viaja aquí: la sucursal se crea siempre en el negocio del
 * token. Dejarlo en el body significaba que el cliente elegía en qué negocio
 * escribir, que es justo lo que no puede decidir.
 *
 * Con whitelist + forbidNonWhitelisted, mandarlo ahora devuelve 400.
 */
export class CreateBranchDto {

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