import { IsBoolean, IsOptional, IsString, IsUUID, Length, Matches } from "class-validator";

export class UpdateBranchDto {
    @IsUUID()
    branchId!: string;

    @IsOptional()
    @IsString()
    @Length(2, 100)
    name?: string;

    @IsOptional()
    @IsString()
    @Length(2, 150)
    address?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9]+$/, {
        message: 'El teléfono debe contener solo números',
    })
    phone?: string;

    @IsOptional()
    @IsString()
    @Length(2, 100)
    city?: string;

    @IsOptional()
    @IsString()
    @Length(2, 100)
    department?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}