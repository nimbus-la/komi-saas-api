import { RolRepository } from "@/context/rol/domain/rol.respository";
import { RolEntity } from "../models/rol.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RolAggregate, RolCode, RolId, RolName } from "@/context/rol/domain";
import { RolResponse } from "@/context/rol/domain/types/rol-response";
import { RolMapper } from "../mappers/rol-mapper";


export class RolService implements RolRepository {

    constructor(
        @InjectRepository(RolEntity)
        private readonly rolRepository: Repository<RolEntity>,
    ) {}

    public async save(rol: RolAggregate): Promise<void> {
        const primitives = rol.toPrimitives();

        const row = this.rolRepository.create({
            id: primitives.id,
            code: primitives.code,
            name: primitives.name,
            createdAt: primitives.createdAt,
            updatedAt: primitives.updatedAt,
        });

        await this.rolRepository.save(row);
    }

    public async searchById(id: RolId): Promise<RolResponse | null> {
        const row = await this.rolRepository.findOne({
            where: {
                id: id.value,
            },
        });

        if (!row) {
            return null;
        }

        return RolMapper.toResponse(row);
    }

    public async searchAggregateById(
        id: RolId,
    ): Promise<RolAggregate | null> {

        const row = await this.rolRepository.findOne({
            where: {
                id: id.value,
            },
        });

        if (!row) {
            return null;
        }

        return RolMapper.toAggregate(row);
    }

    public async existsByName(name: RolName): Promise<boolean> {
        const count = await this.rolRepository
            .createQueryBuilder("rol")
            .where("rol.name ILIKE :name", { name: name.value })
            .getCount();

        return count > 0;
    }

    public async existsByCode(code: RolCode): Promise<boolean> {
        const count = await this.rolRepository
            .createQueryBuilder("rol")
            .where("rol.code = :code", { code: code.value })
            .getCount();

        return count > 0;
    }

    public async searchAll(): Promise<RolResponse[]> {

        const rows = await this.rolRepository.find();

        return rows.map((row) => RolMapper.toResponse(row));
    }

    public async update(rol: RolAggregate): Promise<void> {
        const primitives = rol.toPrimitives();

        await this.rolRepository.update(
            { id: primitives.id },
            {
                code: primitives.code,
                name: primitives.name,
                updatedAt: new Date(),
            },
        );
    }
}