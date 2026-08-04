import { RolScopeEnum } from "./rol-scope.enum";

export interface RolCreatedProps {
    rolId: string;
    code: string;
    name: string;
    scope: RolScopeEnum;
}