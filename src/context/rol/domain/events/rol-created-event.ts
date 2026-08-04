import { DomainEvent } from "@/shared";
import { RolCreatedProps, RolScopeEnum } from "../types";

export class RolCreatedEvent extends DomainEvent {
    public readonly eventName = "rol.created";

    public readonly rolId: string;
    public readonly code: string;
    public readonly name: string;
    public readonly scope: RolScopeEnum;

    constructor(props: RolCreatedProps) {
        super();

        this.rolId = props.rolId;
        this.code = props.code;
        this.name = props.name;
        this.scope = props.scope;
    }
}