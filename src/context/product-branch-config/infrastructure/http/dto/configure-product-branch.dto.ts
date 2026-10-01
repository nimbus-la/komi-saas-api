import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsNumberString, IsOptional, IsUUID, ValidateNested } from "class-validator";


/**
 * Una entrada de la lista: precio y estado del producto en UNA sucursal. Un
 * campo que no se envía no cambia, y un campo en null vuelve a heredar el valor
 * del producto.
 */
export class BranchConfigEntryDto {
    @IsUUID()
    branchId!: string;

    @IsOptional()
    @IsNumberString({}, { message: 'price debe ser un valor numérico o null.' })
    price?: string | null;

    @IsOptional()
    @IsBoolean({ message: 'isAvailable debe ser true, false o null.' })
    isAvailable?: boolean | null;
};


/**
 * Configuración del producto en varias sucursales. Parcial: solo toca las
 * sucursales enviadas.
 *
 *   { "productId": "uuid", "branches": [
 *       { "branchId": "uuid-norte", "price": "18000" },
 *       { "branchId": "uuid-sur",   "isAvailable": false }
 *   ] }
 */
export class ConfigureProductBranchDto {
    @IsUUID()
    productId!: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'Debe enviar al menos una sucursal.' })
    @ValidateNested({ each: true })
    @Type(() => BranchConfigEntryDto)
    branches!: BranchConfigEntryDto[];
};
