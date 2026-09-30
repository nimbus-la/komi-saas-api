import { IsUUID } from "class-validator";


export class RemoveProductBranchConfigDto {
    @IsUUID()
    productId!: string;

    @IsUUID()
    branchId!: string;
};
