import { Paginated, Pagination } from "@/interfaces";

import { BranchAggregate } from "./branch.aggregate";
import { BranchResponse, SearchBranchesFilters } from "./interfaces";
import { BranchId, BranchName } from "./value-object";


/** Acceso a las sucursales guardadas. Toda búsqueda queda limitada al negocio que la pide. */
export abstract class BranchRepository {

    abstract save(branch: BranchAggregate): Promise<void>;
    abstract update(branch: BranchAggregate): Promise<void>;

    /**
     * Busca la sucursal por su id dentro del negocio. El negocio se filtra en la propia
     * consulta y no después, para que una sucursal de otro negocio nunca llegue a
     * salir de la base y simplemente se trate como inexistente.
     */
    abstract searchAggregateById(id: BranchId, tenantId: string): Promise<BranchAggregate | null>;

    /** Indica si el nombre ya está en uso dentro del negocio. En otros negocios se puede repetir. */
    abstract existsByName(name: BranchName, tenantId: string): Promise<boolean>;

    /**
     * Comprueba en una sola consulta que la sucursal pertenezca al negocio, esté activa
     * y no esté eliminada. Los módulos de usuarios e inventario lo usan antes de asignarle
     * personal o existencias, así que una sucursal inactiva no recibe nada.
     */
    abstract existsInTenant(id: BranchId, tenantId: string): Promise<boolean>;

    /** Lista las sucursales del negocio con paginación. Los demás filtros son opcionales. */
    abstract search(filters: SearchBranchesFilters, pagination: Pagination): Promise<Paginated<BranchResponse>>;
}