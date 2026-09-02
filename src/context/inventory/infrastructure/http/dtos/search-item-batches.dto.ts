import { Type } from "class-transformer";
import { IsInt, IsOptional, IsUUID, Min } from "class-validator";


/**
 * Lotes de un item. Pagina igual que el listado de items: el parametro se llama
 * pageNumber en los dos, no page en uno y pageNumber en el otro.
 */
export class SearchItemBatchesDto {
    @IsUUID()
    itemId!: string;

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
