import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/;
const PASSWORD_PATTERN_MESSAGE =
  "La contraseña debe contener al menos una mayúscula, una minúscula y un número.";

export class ChangeUserPasswordDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  @MinLength(12)
  @MaxLength(100)
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_PATTERN_MESSAGE })
  currentPassword?: string;

  @IsString()
  @MinLength(12)
  @MaxLength(100)
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_PATTERN_MESSAGE })
  newPassword!: string;
}
