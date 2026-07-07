import { TenantAggregate } from './tenant.aggregate';
import { TenantResponse } from './types';
import { TenantId, TenantName, TenantNit, TenantSlug } from './value-object';
//import { TenantAccountId } from './value-object/tenant-account.id.value-object';//

export abstract class TenantRepository {
   abstract save(tenant: TenantAggregate): Promise<void>;
   abstract update(tenant: TenantAggregate): Promise<void>;
   //abstract delete(id: TenantId): Promise<void>;


   abstract searchById(id: TenantId): Promise<TenantResponse  | null>;
   abstract searchAggregateById(id: TenantId): Promise<TenantAggregate | null>;
   abstract searchAggregateByNit(nit: TenantNit): Promise<TenantAggregate | null>;
   
   abstract searchAll(): Promise<TenantResponse[]>;

   abstract existsByName(name: TenantName): Promise<boolean>;
   abstract existsBySlug(slug: TenantSlug): Promise<boolean>;
   abstract existsByNit(nit: TenantNit): Promise<boolean>;
   //abstract existsByAccountId(accountId: TenantAccountId): Promise<boolean>;

}
