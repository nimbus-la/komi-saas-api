import { IsBoolean, IsNumberString, IsOptional, IsUUID } from "class-validator";


/**
 * Precio y estado de un producto en una sucursal. Parcial: un campo que no se
 * envía no cambia, y un campo en null vuelve a heredar el valor del producto.
 *
 *   { "productId": "uuid", "branchId": "uuid", "price": "18000", "isAvailable": null }
 */
export class ConfigureProductBranchDto {
    @IsUUID()
    productId!: string;

    @IsUUID()
    branchId!: string;

    @IsOptional()
    @IsNumberString({}, { message: 'price debe ser un valor numérico o null.' })
    price?: string | null;

    @IsOptional()
    @IsBoolean({ message: 'isAvailable debe ser true, false o null.' })
    isAvailable?: boolean | null;
};
