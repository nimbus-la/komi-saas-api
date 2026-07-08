import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from "class-validator";

export class CreateProductDto {
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
}