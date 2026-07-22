import { UserSexEnum } from "@/context/user/domain";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  userName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  lastName?: string;

  @IsOptional()
  @IsDateString()
  age?: Date;

  @IsOptional()
  @IsEnum(UserSexEnum)
  sex?: UserSexEnum;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, {
    message: "El teléfono contiene caracteres no válidos.",
  })
  @MinLength(7)
  @MaxLength(20)
  phone?: string;
}
