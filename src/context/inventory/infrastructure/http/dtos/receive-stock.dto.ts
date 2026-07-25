import { IsISO8601, IsOptional, IsString, IsUUID } from "class-validator";


export class ReceiveStockDto {
    @IsUUID()
    tenantId!: string;

    @IsUUID()
    branchId!: string;
    
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