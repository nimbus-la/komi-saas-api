import { DomainEvent } from "@/shared";
import { RolCreatedProps } from "../types";

export class RolCreatedEvent extends DomainEvent {
    public readonly eventName = "rol.created";

    public readonly rolId: string;
    public readonly code: string;
    public readonly name: string;

    constructor(props: RolCreatedProps) {
        super();

        this.rolId = props.rolId;
        this.code = props.code;
        this.name = props.name;
    }
}