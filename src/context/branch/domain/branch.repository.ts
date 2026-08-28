import { BranchAggregate } from "./branch.aggregate";
import { BranchResponse } from "./types";
import { BranchId, BranchName } from "./value-object";


export abstract class BranchRepository {

    abstract save(branch: BranchAggregate): Promise<void>;
    abstract update(branch: BranchAggregate): Promise<void>;
    // abstract delete(id: BranchId): Promise<void>;

    abstract searchById(id: BranchId): Promise<BranchResponse | null>;
    abstract searchAggregateById(id: BranchId): Promise<BranchAggregate | null>;

    abstract searchAll(): Promise<BranchResponse[]>;

    abstract existsByName(name: BranchName): Promise<boolean>;

    /**
     * Comprueba que la sucursal exista Y pertenezca a ese negocio, en una sola
     * consulta. Es lo que necesitan los contextos de afuera: traer la sucursal
     * con searchById y comparar el tenantId después deja que la consulta
     * devuelva filas de otro negocio.
     */
    abstract existsInTenant(id: BranchId, tenantId: string): Promise<boolean>;

    public abstract searchByTenantId(tenantId: string,): Promise<BranchResponse[]>;
}