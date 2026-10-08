import {
    IsNotEmpty,
    IsNumberString,
    IsOptional,
} from "class-validator";

// Recetas: desconectado en esta versión. El costo salía de la receta.
// import { Type } from "class-transformer";
// import { ArrayNotEmpty, IsArray, IsUUID, ValidateNested } from "class-validator";
//
// export class ProfitabilityRecipeLineDto {
//     @IsUUID()
//     @IsNotEmpty()
//     inventoryItemId!: string;
//
//     @IsNumberString()
//     @IsNotEmpty()
//     quantity!: string;
// }

export class CalculateProfitabilityDto {
    /** Costo del producto. */
    @IsNumberString()
    @IsNotEmpty()
    cost!: string;

    @IsOptional()
    @IsNumberString()
    price?: string;

    /** Margen sobre el precio de venta, de 0 a 100. */
    @IsOptional()
    @IsNumberString()
    targetMargin?: string;

    // Recetas: desconectado en esta versión.
    // @IsArray()
    // @ArrayNotEmpty()
    // @ValidateNested({ each: true })
    // @Type(() => ProfitabilityRecipeLineDto)
    // receta!: ProfitabilityRecipeLineDto[];
}
