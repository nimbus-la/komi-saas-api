import { Type } from "class-transformer";
import { IsInt, IsOptional, IsUUID, Min } from "class-validator";


export class SearchInventoryItemsDto {
    @IsUUID()
    tenantId!: string;

    @IsOptional()
    @IsUUID()
    branchId?: string;

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
};
