import { UserSexEnum } from "@/context/user/domain";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateUserDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      "El nombre de usuario solo puede contener letras, números, puntos, guiones bajos y guiones.",
  })
  userName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  secondName?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstLastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  secondLastName?: string | null;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(UserSexEnum)
  sex?: UserSexEnum;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, {
    message: "El teléfono contiene caracteres no válidos.",
  })
  @MinLength(7)
  @MaxLength(15)
  phone?: string;
}