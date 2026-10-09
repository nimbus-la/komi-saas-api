import {
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";

// Recetas: desconectado en esta versión.
// import { Type } from "class-transformer";
// import { IsArray, ValidateNested } from "class-validator";
// import { CreateRecipeIngredientDto } from "./create-recipe-ingredient.dto";

export class CreateProductDto {

  @IsUUID()
  categoryId!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsOptional()
  description: string | undefined;

  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  /**
   * Precio, costo y margen tienen que cuadrar: el precio debe dejar ese margen
   * sobre el costo. El front puede obtener el precio en POST /products/profitability.
   */
  @IsString()
  price!: string;

  @IsNumberString()
  cost!: string;

  @IsNumberString()
  targetMargin!: string;

  // Recetas: desconectado en esta versión.
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateRecipeIngredientDto)
  // recipe!: CreateRecipeIngredientDto[];
}
