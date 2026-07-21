import { Type } from "class-transformer";

import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
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

  @IsBoolean()
  productStatus!: boolean;

  @IsString()
  productBasePrice!: string;

  @IsNumber()
  @Min(0)
  profitMargin!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  recipe!: CreateRecipeIngredientDto[];
}