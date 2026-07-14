import { IsNumberString, IsOptional, IsUUID, ValidateIf } from "class-validator";

export class SetMinimumStockDto {
    @IsOptional()
    @IsUUID()
    branchId?: string;

    // Debe venir siempre (aunque sea null, para limpiar el mínimo global).
    // Si trae valor, debe ser numérico.
    @ValidateIf((o: SetMinimumStockDto) => o.minStock !== null)
    @IsNumberString()
    minStock!: string | null;
};