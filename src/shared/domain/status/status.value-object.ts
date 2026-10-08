import { EntityStatus } from "./entity-status";
import { InvalidStatusException, StatusAlreadySetException, StatusTransitionNotAllowedException } from "./status.exception";

export class Status {
    /**
     * A dónde se puede ir desde cada estado. DELETED no tiene salida. ARCHIVED
     * queda escrito para la papelera, aunque hoy nada llega a él.
     */
    private static readonly TRANSITIONS: Record<EntityStatus, readonly EntityStatus[]> = {
        [EntityStatus.Active]: [EntityStatus.Inactive, EntityStatus.Deleted],
        [EntityStatus.Inactive]: [EntityStatus.Active, EntityStatus.Deleted],
        [EntityStatus.Archived]: [EntityStatus.Inactive, EntityStatus.Deleted],
        [EntityStatus.Deleted]: [],
    };


    private constructor(private readonly value: EntityStatus) { }


    public static active(): Status {
        return new Status(EntityStatus.Active);
    }


    public static create(value: string): Status {
        if (!Status.isEntityStatus(value)) {
            throw new InvalidStatusException(value);
        };

        return new Status(value);
    }


    public canTransitionTo(next: EntityStatus): boolean {
        return Status.TRANSITIONS[this.value].includes(next);
    }


    public transitionTo(next: EntityStatus): Status {
        if (next === this.value) {
            throw new StatusAlreadySetException(next);
        }

        if (!this.canTransitionTo(next)) {
            throw new StatusTransitionNotAllowedException(this.value, next);
        }

        return new Status(next);
    }


    public is(status: EntityStatus): boolean {
        return this.value === status;
    }


    public isActive(): boolean {
        return this.is(EntityStatus.Active);
    }


    public isDeleted(): boolean {
        return this.is(EntityStatus.Deleted);
    }


    /** Solo lo activo o pausado se edita; lo archivado o eliminado no. */
    public isEditable(): boolean {
        return this.is(EntityStatus.Active) || this.is(EntityStatus.Inactive);
    }
    

    public equals(other: Status): boolean {
        return this.value === other.value;
    }


    private static isEntityStatus(value: string): value is EntityStatus {
        return Object.values(EntityStatus).includes(value as EntityStatus);
    }
}