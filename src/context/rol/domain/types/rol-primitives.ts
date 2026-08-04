import { RolScopeEnum } from "./rol-scope.enum";

export interface RolPrimitives {
    id: string;
    code: string;
    name: string;
    scope: RolScopeEnum;
    createdAt: Date;
    updatedAt: Date;
}