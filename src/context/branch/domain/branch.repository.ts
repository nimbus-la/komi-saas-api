import { Paginated, Pagination } from "@/interfaces";

import { BranchAggregate } from "./branch.aggregate";
import { BranchResponse, SearchBranchesFilters } from "./types";
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
    abstract searchAggregateById(id: BranchId, tenantId: string): Promise<BranchAggregate | null>;

    /** El nombre solo tiene que ser único dentro del negocio, no en toda la base. */
    abstract existsByName(name: BranchName, tenantId: string): Promise<boolean>;

    /**
     * Comprueba en una sola consulta que la sucursal pertenezca a ese negocio y
     * pueda operar: activa y no eliminada. Es lo que usan user e inventory antes
     * de asignarle personal o stock, así que una sucursal inactiva no recibe nada.
     */
    abstract existsInTenant(id: BranchId, tenantId: string): Promise<boolean>;

    /** Siempre acotado al negocio; el resto de filtros son opcionales. */
    abstract search(filters: SearchBranchesFilters, pagination: Pagination): Promise<Paginated<BranchResponse>>;
}