import { Type } from "class-transformer";
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { UpdateRecipeIngredientDto } from "./update-recipe-ingredient.dto";
import { ENTITY_STATUSES_USER_SET, EntityStatus } from "@/shared";


export class UpdateProductDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsUUID()
  productCategoryId!: string;

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
  @IsIn(ENTITY_STATUSES_USER_SET)
  status!: EntityStatus;

  @IsOptional()
  @IsString()
  productBasePrice!: string;

  @IsOptional()
  @IsNumber()
  profitMargin?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateRecipeIngredientDto)
  recipe?: UpdateRecipeIngredientDto[];
}
