import { IsISO8601, IsOptional, IsString } from "class-validator";


export class ReceiveStockDto {
    @IsString()
    quantityReceived!: string;


    @IsString()
    totalCostAmount!: string;


    @IsOptional()
    @IsISO8601()
    expirationDate?: string;


    @IsOptional()
    @IsISO8601()
    receivedAt?: string;
};