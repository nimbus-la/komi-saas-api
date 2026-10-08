import {
  IsIn,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { ENTITY_STATUSES_USER_SET, EntityStatus } from "@/shared";

// Recetas: desconectado en esta versión.
// import { Type } from "class-transformer";
// import { ValidateNested } from "class-validator";
// import { UpdateRecipeIngredientDto } from "./update-recipe-ingredient.dto";


export class UpdateProductDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  /**
   * Si cambia el precio, el costo o el margen, lo que no llegue se toma de lo
   * guardado y los tres resultantes tienen que cuadrar.
   */
  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsNumberString()
  cost?: string;

  @IsOptional()
  @IsNumber()
  targetMargin?: number;

  @IsOptional()
  @IsIn(ENTITY_STATUSES_USER_SET)
  status?: EntityStatus;

  // Recetas: desconectado en esta versión.
  // @IsOptional()
  // @ValidateNested({ each: true })
  // @Type(() => UpdateRecipeIngredientDto)
  // recipe?: UpdateRecipeIngredientDto[];
}
