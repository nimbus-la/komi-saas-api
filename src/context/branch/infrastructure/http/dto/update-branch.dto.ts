import { IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";

/**
 * Mismas reglas que CreateBranchDto, pero todos los campos son opcionales.
 * Si llega solo el branchId, el agregado responde con el 1031.
 */
export class UpdateBranchDto {
    @IsUUID()
    branchId!: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(30)
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(100)
    address?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, {
        message: 'El teléfono contiene caracteres no válidos',
    })
    @MinLength(7)
    @MaxLength(15)
    phone?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    city?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    department?: string;
}
