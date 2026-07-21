import { IsISO8601, IsOptional, IsString, IsUUID, Matches, MinLength } from "class-validator";

export class AdjustBatchDto {
    @IsUUID()
    batchId!: string;

    @Matches(/^\d+(\.\d{1,3})?$/, { message: 'actualQuantity debe ser numérico (hasta 3 decimales).' })
    actualQuantity!: string;

    @IsString()
    @MinLength(3, { message: 'El motivo debe tener al menos 3 caracteres.' })
    reason!: string;

    @IsOptional()
    @IsISO8601()
    occurredAt?: string;
};