import { IsUUID } from "class-validator";

export class ToggleUserStatusDto {
  @IsUUID()
  userId!: string;
}
