import { Transform, Type } from "class-transformer";
import {
    IsBoolean,
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from "class-validator";

export class SearchCategoriesDto {

    @IsUUID()
    tenantId!: string;

    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsUUID()
    id?: string;

    // Llega como string en el query: sin este Transform, "false" sería truthy.
    @IsOptional()
    @Transform(({ value }) =>
        value === undefined ? undefined : value === "true" || value === true,
    )
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsDateString()
    createdAt?: string;

    @IsOptional()
    @IsDateString()
    updatedAt?: string;

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
