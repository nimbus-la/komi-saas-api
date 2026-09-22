import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class ChangeUserPasswordDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  currentPassword?: string;

  @IsString()
  @MinLength(12)
  @MaxLength(100)
  newPassword!: string;
}