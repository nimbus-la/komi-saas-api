import { IsNumberString, ValidateIf } from "class-validator";


/**
 * Minimo GLOBAL del item: el umbral por defecto para toda sucursal sin override.
 *
 *   { "minStock": "2000" }   -> fija el minimo global
 *   { "minStock": null }     -> lo limpia
 */
export class SetGlobalMinimumStockDto {
    @ValidateIf((dto: SetGlobalMinimumStockDto) => dto.minStock !== null)
    @IsNumberString({}, { message: 'minStock debe ser un valor numerico o null.' })
    minStock!: string | null;
};
