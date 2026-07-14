import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from "class-validator";

import { MovementType } from "../../../domain";


export class SearchInventoryMovementsDto {
    @IsOptional()
    @IsUUID()
    inventoryItemId?: string;

    @IsOptional()
    @IsUUID()
    branchId?: string;

    @IsOptional()
    @IsEnum(MovementType)
    movementType?: MovementType;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    pageNumber = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    pageSize = 20;
}