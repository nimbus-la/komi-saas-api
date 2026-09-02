import { IsOptional, IsUUID } from "class-validator";
export class ReassignUserDto {
  @IsUUID()
  userId!: string;

  @IsUUID() 
  rolId!: string;

  @IsOptional() 
  @IsUUID() 
  branchId?: string | null;
}
