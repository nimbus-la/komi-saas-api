import { RolAggregate } from "./rol.aggregate";
import { RolResponse } from "./types/rol-response";
import { RolCode, RolId, RolName } from "./value-object";

export abstract class RolRepository {

    abstract save(rol: RolAggregate): Promise<void>;

    abstract searchById(id: RolId): Promise<RolResponse | null>;

    abstract searchAggregateById(id: RolId): Promise<RolAggregate | null>;

    abstract existsByName(name: RolName): Promise<boolean>;

    abstract existsByCode(code: RolCode): Promise<boolean>;

    abstract searchAll(): Promise<RolResponse[]>;

    abstract update(rol: RolAggregate): Promise<void>;
}