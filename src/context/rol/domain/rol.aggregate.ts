import { AggregateRoot } from "@/shared";
import { RolCode, RolId, RolName } from "./value-object";
import { RolCreatedEvent } from "./events/rol-created-event";
import { RolPrimitives } from "./types";

export class RolAggregate extends AggregateRoot<RolId> {

    private code: RolCode;
    private name: RolName;
    private createdAt: Date;
    private updatedAt: Date;

    private constructor(
        id: RolId,
        code: RolCode,
        name: RolName,
        createdAt: Date,
        updatedAt: Date,
    ) {
        super(id);

        this.code = code;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    private touch(): void {
        this.updatedAt = new Date();
    }

    public static create(params: {
        code: RolCode;
        name: RolName;
    }): RolAggregate {

        const now = new Date();

        const rol = new RolAggregate(
            RolId.generate(),
            params.code,
            params.name,
            now,
            now,
        );

        rol.registerEvent(
            new RolCreatedEvent({
                rolId: rol.id.value,
                code: rol.code.value,
                name: rol.name.value,
            }),
        );

        return rol;
    }

    public toPrimitives(): RolPrimitives {
        return {
            id: this.id.value,
            code: this.code.value,
            name: this.name.value,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    public static fromPrimitives(
        primitives: RolPrimitives,
    ): RolAggregate {

        return new RolAggregate(
            RolId.create(primitives.id),
            RolCode.create(primitives.code),
            RolName.create(primitives.name),
            primitives.createdAt,
            primitives.updatedAt,
        );
    }

    public update(params: {
        code?: RolCode;
        name?: RolName;
    }): void {

        if (params.code) {
            this.code = params.code;
        }

        if (params.name) {
            this.name = params.name;
        }

        this.touch();
    }
}