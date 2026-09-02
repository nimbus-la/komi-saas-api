import { IsISO8601, IsOptional, IsString, IsUUID } from "class-validator";

export class ConsumeStockDto {
    @IsUUID()
    itemId!: string;

    @IsUUID()
    branchId!: string;
    
    @IsString()
    quantity!: string;


    @IsOptional()
    @IsISO8601()
    consumedAt?: string;
};