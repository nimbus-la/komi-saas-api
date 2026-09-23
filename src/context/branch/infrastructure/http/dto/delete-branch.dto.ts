import { IsUUID } from "class-validator";

export class DeleteBranchDto {
    @IsUUID()
    branchId!: string;
}
