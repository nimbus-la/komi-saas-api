import { IsOptional, IsUUID } from "class-validator";
export class ReassignUserDto {
  @IsUUID() rolId!: string;
  @IsOptional() @IsUUID() branchId?: string | null;
}
