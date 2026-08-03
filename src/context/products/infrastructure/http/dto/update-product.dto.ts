import { Type } from "class-transformer";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { UpdateRecipeIngredientDto } from "./update-recipe-ingredient.dto";


export class UpdateProductDto {
  @IsOptional()
  @IsUUID()
  productCategoryId!: string;

  @IsOptional()
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsString()
  productName!: string;

  @IsOptional()
  @IsString()
  productDescription?: string | undefined;

  @IsOptional()
  @IsString()
  productImgUrl?: string | undefined;

  @IsOptional()
  @IsBoolean()
  productStatus!: boolean;

  @IsOptional()
  @IsString()
  productBasePrice!: string;

  @IsOptional()
  @IsNumber()
  profitMargin!: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateRecipeIngredientDto)
  recipe?: UpdateRecipeIngredientDto[];
}