import {
  IsNumber,
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

  @IsString()
  price!: string;

  @IsNumber()
  targetMargin!: number;

  // Recetas: desconectado en esta versión.
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateRecipeIngredientDto)
  // recipe!: CreateRecipeIngredientDto[];
}
