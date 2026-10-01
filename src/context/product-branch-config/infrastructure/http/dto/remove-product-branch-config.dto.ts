import { ArrayMinSize, IsArray, IsUUID } from "class-validator";


/**
 * Sucursales a las que se les quita la configuración del producto.
 *
 *   { "productId": "uuid", "branchIds": ["uuid-norte", "uuid-sur"] }
 */
export class RemoveProductBranchConfigDto {
    @IsUUID()
    productId!: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'Debe enviar al menos una sucursal.' })
    @IsUUID('all', { each: true })
    branchIds!: string[];
};
