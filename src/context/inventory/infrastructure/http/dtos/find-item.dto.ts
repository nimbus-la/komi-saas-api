import { IsOptional, IsUUID } from "class-validator";


/**
 * Detalle de un item. El itemId viaja por query, no por la ruta, para que el
 * endpoint quede alineado con el resto: el identificador es un dato validado
 * mas del DTO y no un segmento suelto sin validar.
 *
 *   ?itemId=uuid-item                      -> detalle con el stock consolidado
 *   ?itemId=uuid-item&branchId=uuid-sede   -> detalle acotado a una sucursal
 */
export class FindInventoryItemDto {
    @IsUUID()
    itemId!: string;

    @IsOptional()
    @IsUUID()
    branchId?: string;
};
