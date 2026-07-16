import {
    IsUUID,
    IsString,
    IsBoolean,
    IsNumberString,
    MaxLength,
} from "class-validator";
export class UpdateRecipeItemDto {
    @IsUUID()
    productId!: string;

    @IsUUID()
    inventoryItemId!: string;

    @IsNumberString()
    quantity!: string;

    @IsString()
    @MaxLength(20)
    unit!: string;

    @IsNumberString()
    lineCost!: string;

    @IsBoolean()
    isOptional!: boolean;
}