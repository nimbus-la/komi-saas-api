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

export class CreateUserDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsUUID()
  rolId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  userName!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @IsString()
  @MinLength(12)
  @MaxLength(100)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  secondName?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstLastName!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  secondLastName?: string;

  @IsDateString()
  age!: Date;

  @IsEnum(UserSexEnum)
  sex!: UserSexEnum;

  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, {
    message: "El teléfono contiene caracteres no válidos.",
  })
  @MinLength(7)
  @MaxLength(15)
  phone!: string;
}