import {
    IsBoolean,
    IsNotEmpty,
    IsNumberString,
    IsUUID,
} from "class-validator";

export class CreateRecipeIngredientDto {
    @IsUUID()
    @IsNotEmpty()
    inventoryItemId!: string;

    @IsNumberString()
    @IsNotEmpty()
    quantity!: string;

    @IsBoolean()
    isOptional!: boolean;
}