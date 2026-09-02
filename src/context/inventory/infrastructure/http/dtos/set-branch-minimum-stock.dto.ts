import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumberString, IsUUID, ValidateIf, ValidateNested } from "class-validator";



/** Una entrada del listado: el minimo de UNA sucursal. */
export class BranchMinimumDto {
    @IsUUID()
    branchId!: string;

    /** null elimina el override de esa sucursal (vuelve a heredar el global). */
    @ValidateIf((dto: BranchMinimumDto) => dto.minStock !== null)
    @IsNumberString({}, { message: 'minStock debe ser un valor numerico o null.' })
    minStock!: string | null;
};



/**
 * Minimo POR SUCURSAL, en lote. Parcial: solo toca las sucursales enviadas.
 *
 *   { "itemId": "uuid-item", "branches": [
 *       { "branchId": "uuid-norte", "minStock": "5000" },
 *       { "branchId": "uuid-sur",   "minStock": null }
 *   ] }
 */
export class SetBranchMinimumStockDto {
    @IsUUID()
    itemId!: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'Debe enviar al menos una sucursal.' })
    @ValidateNested({ each: true })
    @Type(() => BranchMinimumDto)
    branches!: BranchMinimumDto[];
};
