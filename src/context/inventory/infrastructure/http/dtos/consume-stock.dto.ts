import { IsISO8601, IsOptional, IsString } from "class-validator";

export class ConsumeStockDto {
    
    @IsString()
    quantity!: string;


    @IsOptional()
    @IsISO8601()
    consumedAt?: string;
};