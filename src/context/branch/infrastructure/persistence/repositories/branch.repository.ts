import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Paginated, Pagination } from "@/interfaces";

import { BranchAggregate, BranchId, BranchName, BranchRepository, BranchResponse, SearchBranchesFilters } from "../../../domain";

import { BranchEntity } from "../models/branch.entity";
import { BranchMapper } from "../mappers/branch.mapper";

@Injectable()
export class BranchService implements BranchRepository {

    constructor(
        @InjectRepository(BranchEntity)
        private readonly branchRepository: Repository<BranchEntity>,
    ) {}

    public async save(branch: BranchAggregate): Promise<void> {
        const primitives = branch.toPrimitives();

        const row = this.branchRepository.create({
            id: primitives.id,
            tenantId: primitives.tenantId,
            name: primitives.name,
            address: primitives.address,
            phone: primitives.phone,
            city: primitives.city,
            department: primitives.department,
            isActive: primitives.isActive,
            isDeleted: primitives.isDeleted,
            createdAt: primitives.createdAt,
            updatedAt: primitives.updatedAt,
        });

        await this.branchRepository.save(row);
    }

    public async searchAggregateById(
        id: BranchId,
        tenantId: string
    ): Promise<BranchAggregate | null> {

        const row = await this.branchRepository.findOne({
            where: {
                id: id.value,
                tenantId,
                isDeleted: false,
            },
        });

        return row ? BranchMapper.toAggregate(row) : null;
    }

    public async existsByName(name: BranchName, tenantId: string): Promise<boolean> {
        const count = await this.branchRepository
            .createQueryBuilder("branch")
            .where("branch.name ILIKE :name", { name: BranchService.escapeLike(name.value) })
            .andWhere("branch.tenantId = :tenantId", { tenantId })
            // Una sucursal eliminada libera su nombre.
            .andWhere("branch.isDeleted = false")
            .getCount();

        return count > 0;
    }

    public async existsInTenant(id: BranchId, tenantId: string): Promise<boolean> {

        const count = await this.branchRepository.count({
            where: {
                id: id.value,
                tenantId,
                isDeleted: false,
            },
        });

        return count > 0;
    }

    public async update(branch: BranchAggregate): Promise<void> {
        const primitives = branch.toPrimitives();

        await this.branchRepository.update(
            { id: primitives.id, tenantId: primitives.tenantId, isDeleted: false },
            {
                name: primitives.name,
                address: primitives.address,
                phone: primitives.phone,
                city: primitives.city,
                department: primitives.department,
                isActive: primitives.isActive,
                isDeleted: primitives.isDeleted,
                updatedAt: new Date(),
            }
        );
    }

    public async search(
        filters: SearchBranchesFilters,
        pagination: Pagination,
    ): Promise<Paginated<BranchResponse>> {
        const query = this.branchRepository
            .createQueryBuilder("branch")
            .where("branch.tenantId = :tenantId", { tenantId: filters.tenantId })
            .andWhere("branch.isDeleted = false");

        if (filters.branchId) {
            query.andWhere("branch.id = :branchId", { branchId: filters.branchId });
        }

        const text = filters.text?.trim();

        if (text) {
            query.andWhere(
                `(branch.name ILIKE :text
                  OR branch.address ILIKE :text
                  OR branch.phone ILIKE :text
                  OR branch.city ILIKE :text
                  OR branch.department ILIKE :text)`,
                { text: `%${BranchService.escapeLike(text)}%` },
            );
        }

        if (filters.branchStatus !== undefined) {
            query.andWhere("branch.isActive = :status", { status: filters.branchStatus });
        }

        // El id desempata para que el orden sea estable entre páginas.
        const [rows, total] = await query
            .orderBy("branch.name", "ASC")
            .addOrderBy("branch.id", "ASC")
            .skip((pagination.pageNumber - 1) * pagination.pageSize)
            .take(pagination.pageSize)
            .getManyAndCount();

        return {
            rows: rows.map((row) => BranchMapper.toResponse(row)),
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
            total,
        };
    }

    /** Escapa los comodines de LIKE para que "%" o "_" se busquen como texto. */
    private static escapeLike(text: string): string {
        return text.replace(/[\\%_]/g, (character) => `\\${character}`);
    }
}