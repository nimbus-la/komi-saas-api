import { RolAggregate } from "./rol.aggregate";
import { RolResponse } from "./types/rol-response";
import { RolId } from "./value-object";

export abstract class RolRepository {
  abstract searchById(id: RolId): Promise<RolResponse | null>;
  abstract searchAggregateById(id: RolId): Promise<RolAggregate | null>;
  abstract searchAll(): Promise<RolResponse[]>;
}
