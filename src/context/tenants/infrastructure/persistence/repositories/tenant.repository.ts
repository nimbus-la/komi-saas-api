import { InjectRepository } from "@nestjs/typeorm";
import { TenantAggregate, TenantId, TenantName, TenantNit, TenantRepository, TenantResponse, TenantSlug } from "../../../domain";
import { TenantEntity } from "../models/tenant.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { TenantMapper } from "../mappers/tenant-mapper";

@Injectable()
export class TenantService implements TenantRepository {
    constructor(
        @InjectRepository(TenantEntity)
        private readonly tenantRepository: Repository<TenantEntity>,
    ) { };

    public async save(tenant: TenantAggregate): Promise<void> {
        const primitives = tenant.toPrimitives();

        const row = this.tenantRepository.create({
            id: primitives.id,
            accountId: primitives.accountId,
            name: primitives.name,
            description: primitives.description,
            slug: primitives.slug,
            nit: primitives.nit,
            isActive: primitives.isActive,
            createdAt: primitives.createdAt,
            updatedAt: primitives.updatedAt,
        });
        
        await this.tenantRepository.save(row);
    };

    public async searchById(id: TenantId) : Promise<TenantResponse  | null> {
        const row = await this.tenantRepository.findOne({
            where: {
                id: id.value
            },
        });

        if(!row) {
            return null;
        }

        return {
            id: row.id,
            accountId: row.accountId,
            name: row.name,
            description: row.description,
            slug: row.slug,
            nit: row.nit,
            created_at: row.createdAt,
            updated_at: row.updatedAt,
            isActive: row.isActive,
            
            //branches: row.branches,
        };
    }


    public async searchAggregateById(id: TenantId): Promise<TenantAggregate | null> {
        const row = await this.tenantRepository.findOne({
            where: {
                id: id.value,
            },
        });

        if (!row) {
            return null;
        }

        return TenantAggregate.fromPrimitives({
            id: row.id,
            accountId: row.accountId,
            name: row.name,
            description: row.description,
            slug: row.slug,
            nit: row.nit,
            isActive: row.isActive,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }

    public async searchAggregateByNit(
        nit: TenantNit
    ): Promise<TenantAggregate | null> {
        const row = await this.tenantRepository.findOne({
            where: {
                nit: nit.value,
            },
        });

        if (!row) {
            return null;
        }

        return TenantAggregate.fromPrimitives({
            id: row.id,
            accountId: row.accountId,
            name: row.name,
            description: row.description,
            slug: row.slug,
            nit: row.nit,
            isActive: row.isActive,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
    
    public async existsByName(name: TenantName): Promise<boolean> {
        const count = await this.tenantRepository
            .createQueryBuilder('tenant')
            .where('tenant.name ILIKE :name', { name: name.value })
            .getCount();

        return count > 0;
    };

    public async existsBySlug(slug: TenantSlug): Promise<boolean> {
        const count = await this.tenantRepository
            .createQueryBuilder('tenant')
            .where('tenant.slug = :slug', { slug: slug.value })
            .getCount();

        return count > 0;
    };

    public async existsByNit(nit: TenantNit): Promise<boolean> {
        const count = await this.tenantRepository
            .createQueryBuilder('tenant')
            .where('tenant.nit = :nit', { nit: nit.value })
            .getCount();
        
        return count > 0;
    };

    public async searchAll(): Promise<TenantResponse[]> {
        const rows = await this.tenantRepository.find();

        return rows.map((row) => TenantMapper.toResponse(row));
    }

    public async update(tenant: TenantAggregate): Promise<void> {
        const primitives = tenant.toPrimitives();

        await this.tenantRepository.update(
            { id: primitives.id },
            {
                name: primitives.name,
                description: primitives.description,
                slug: primitives.slug,
                nit: primitives.nit,
                isActive: primitives.isActive,
            }
        );
    };


};