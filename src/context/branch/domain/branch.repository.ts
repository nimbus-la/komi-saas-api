import { BranchAggregate } from "./branch.agreggate";
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
}