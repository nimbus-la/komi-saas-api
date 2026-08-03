import { RolRepository } from "@/context/rol/domain/rol.repository";
import { RolEntity } from "../models/rol.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RolAggregate, RolCode, RolId, RolName } from "@/context/rol/domain";
import { RolResponse } from "@/context/rol/domain/types/rol-response";
import { RolMapper } from "../mappers/rol-mapper";

export class TypeOrmRolRepository implements RolRepository {
  constructor(
    @InjectRepository(RolEntity)
    private readonly rolRepository: Repository<RolEntity>,
  ) {}

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

  public async searchAggregateById(id: RolId): Promise<RolAggregate | null> {
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
      .where("LOWER(rol.name) = LOWER(:name)", { name: name.value })
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
}
