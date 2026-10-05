import { Type } from "class-transformer";
import {
    ArrayNotEmpty,
    IsArray,
    IsNotEmpty,
    IsNumberString,
    IsOptional,
    IsUUID,
    ValidateNested,
} from "class-validator";

export class ProfitabilityRecipeLineDto {
    @IsUUID()
    @IsNotEmpty()
    inventoryItemId!: string;

    @IsNumberString()
    @IsNotEmpty()
    quantity!: string;
}

export class CalculateProfitabilityDto {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ProfitabilityRecipeLineDto)
    receta!: ProfitabilityRecipeLineDto[];

    @IsOptional()
    @IsNumberString()
    precioVenta?: string;

    /** Margen sobre el precio de venta, de 0 a 100. */
    @IsOptional()
    @IsNumberString()
    margenObjetivo?: string;
}
