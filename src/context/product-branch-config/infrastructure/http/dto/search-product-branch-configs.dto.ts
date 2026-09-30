import { IsUUID } from "class-validator";


export class SearchProductBranchConfigsDto {
    @IsUUID()
    productId!: string;
};
