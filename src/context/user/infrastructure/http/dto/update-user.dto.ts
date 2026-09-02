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

export enum UpdateUserAction {
  ACTIVATE = "ACTIVATE",
  DEACTIVATE = "DEACTIVATE",
  REASSIGN = "REASSIGN",
}

/**
 * Contrato de PATCH /user/update.
 *
 * Acepta campos que UpdateUserUseCase no usa, y sus límites son más flojos que
 * los del dominio. Cada caso queda marcado abajo. Contexto en user.controller.
 *
 * Lo que NO va aquí es exigir que venga al menos un campo: eso es regla de
 * negocio y vive en el agregado, como en inventario (InventoryItemAggregate
 * .update lanza EmptyUpdateException). La DTO valida campo por campo y nada
 * más.
 */
export class UpdateUserDto {
  @IsUUID()
  userId!: string;

  // Sobra: activar y desactivar es PATCH /user/status. UpdateUserParams no
  // tiene action, así que el caso de uso lo descarta; el cliente manda
  // DEACTIVATE, recibe 200 y el usuario sigue activo.
  @IsOptional()
  @IsEnum(UpdateUserAction)
  action?: UpdateUserAction;

  // Sobran: el rol y la sucursal solo se cambian en PATCH /user/reassign, que
  // además comprueba que existan y que el scope del rol admita sucursal. Aquí
  // se descartan igual que action.
  @IsOptional()
  @IsUUID()
  rolId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string | null;

  // Más flojo que el dominio: UserName exige 3-30 y solo [a-zA-Z0-9._-]. Con 50
  // y sin patrón, la petición pasa el pipe y la rechaza el dominio después.
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  userName?: string;

  // El caso de uso acepta null para borrar el correo, pero el tipo no lo dice:
  // debería ser string | null.
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  // Se va de aquí: la contraseña tiene sus propias reglas de autorización y
  // merece su endpoint (ver punto 5 en user.controller). Que MinLength(6)
  // contradiga los 12 caracteres con mayúscula, minúscula y número que exige
  // UserPlainPassword es justo lo que pasa al meterla en una DTO genérica.
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;

  // Nombres equivocados: el caso de uso espera firstName, secondName,
  // firstLastName y secondLastName. Con estos, lo que mande el cliente se
  // descarta. Son strings planos en el agregado (sin value object), así que
  // esta DTO es la única validación que tienen. Límites de más: create usa 2-50.
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

  // @IsDateString valida texto y no lo convierte: llega string, no Date.
  @IsOptional()
  @IsDateString()
  age?: Date;

  @IsOptional()
  @IsEnum(UserSexEnum)
  sex?: UserSexEnum;

  // Más flojo que el dominio: UserPhone corta en 15, no en 20.
  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, {
    message: "El teléfono contiene caracteres no válidos.",
  })
  @MinLength(7)
  @MaxLength(20)
  phone?: string;
}
