import { RolScopeEnum } from "./rol-scope.enum";

export interface RolResponse {
    id: string;
    code: string;
    name: string;
    scope: RolScopeEnum;
    createdAt: Date; 
    updatedAt: Date;
}