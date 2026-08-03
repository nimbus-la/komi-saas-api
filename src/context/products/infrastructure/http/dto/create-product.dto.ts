import { Type } from "class-transformer";

import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from "class-validator";

import { CreateRecipeIngredientDto } from "./create-recipe-ingredient.dto";

export class CreateProductDto {

  @IsUUID()
  tenantId!: string;

  @IsUUID()
  productCategoryId!: string;

  @IsString()
  @MinLength(2)
  productName!: string;

  @IsString()
  @IsOptional()
  productDescription: string | undefined;

  @IsString()
  @IsOptional()
  productImgUrl: string | undefined;

  @IsString()
  productBasePrice!: string;

  @IsNumber()
  profitMargin!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  recipe!: CreateRecipeIngredientDto[];
}