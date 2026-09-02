import { IsNumberString, IsUUID, ValidateIf } from "class-validator";


/**
 * Minimo GLOBAL del item: el umbral por defecto para toda sucursal sin override.
 *
 *   { "itemId": "uuid-item", "minStock": "2000" }   -> fija el minimo global
 *   { "itemId": "uuid-item", "minStock": null }     -> lo limpia
 */
export class SetGlobalMinimumStockDto {
    @IsUUID()
    itemId!: string;

    @ValidateIf((dto: SetGlobalMinimumStockDto) => dto.minStock !== null)
    @IsNumberString({}, { message: 'minStock debe ser un valor numerico o null.' })
    minStock!: string | null;
};
