import {
    IsOptional,
    IsUUID,
    IsInt,
    Min,
} from "class-validator";
import { Type } from "class-transformer";

export class SearchRecipeItemDto {
    @IsOptional()
    @IsUUID()
    productId?: string;

    @IsOptional()
    @IsUUID()
    inventoryItemId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number = 10;
}