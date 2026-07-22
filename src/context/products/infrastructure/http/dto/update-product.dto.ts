import { Type } from "class-transformer";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { UpdateRecipeIngredientDto } from "./update-recipe-ingredient.dto";


export class UpdateProductDto {
  @IsUUID()
  productCategoryId!: string;

  @IsUUID()
  tenantId!: string;

  @IsString()
  @MinLength(2)
  productName!: string;

  @IsOptional()
  @IsString()
  productDescription?: string | undefined;

  @IsOptional()
  @IsString()
  productImgUrl?: string | undefined;

  @IsBoolean()
  productStatus!: boolean;

  @IsString()
  productBasePrice!: string;

  @IsNumber()
  @Min(0)
  profitMargin!: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateRecipeIngredientDto)
  recipe?: UpdateRecipeIngredientDto[];
}