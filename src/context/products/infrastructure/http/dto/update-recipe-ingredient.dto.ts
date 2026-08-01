import { IsBoolean, IsString, IsUUID } from "class-validator";

export class UpdateRecipeIngredientDto {
  @IsUUID()
  inventoryItemId!: string;

  @IsString()
  quantity!: string;

  @IsBoolean()
  isOptional!: boolean;
}