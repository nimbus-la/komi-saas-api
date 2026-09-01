import { BranchAggregate } from "./branch.aggregate";
import { BranchResponse } from "./types";
import { BranchId, BranchName } from "./value-object";


export abstract class BranchRepository {

    abstract save(branch: BranchAggregate): Promise<void>;
    abstract update(branch: BranchAggregate): Promise<void>;
    // abstract delete(id: BranchId): Promise<void>;

    /**
     * El negocio va en la consulta, no se comprueba después: pedir la sucursal por
     * id y comparar el tenantId al recibirla significa que la base ya devolvió una
     * fila ajena, y basta que alguien olvide el if para que salga por la API.
     * Acotando aquí, una sucursal de otro negocio sencillamente no existe.
     */
    abstract searchById(id: BranchId, tenantId: string): Promise<BranchResponse | null>;
    abstract searchAggregateById(id: BranchId, tenantId: string): Promise<BranchAggregate | null>;

    /** El nombre solo tiene que ser único dentro del negocio, no en toda la base. */
    abstract existsByName(name: BranchName, tenantId: string): Promise<boolean>;

    /**
     * Comprueba que la sucursal exista Y pertenezca a ese negocio, en una sola
     * consulta. Es lo que necesitan los contextos de afuera: traer la sucursal
     * con searchById y comparar el tenantId después deja que la consulta
     * devuelva filas de otro negocio.
     */
    abstract existsInTenant(id: BranchId, tenantId: string): Promise<boolean>;

    public abstract searchByTenantId(tenantId: string,): Promise<BranchResponse[]>;
}