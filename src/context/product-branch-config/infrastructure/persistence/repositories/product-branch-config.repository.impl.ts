import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { ProductBranchConfig } from "../../../domain/product-branch-config.aggregate";
import { ProductBranchConfigRepository } from "../../../domain/product-branch-config.repository";
import { ProductBranchConfigId } from "../../../domain/value-objects/product-config-id.value-object";
import { ProductBranchConfigMapper } from "../mappers/product-branch-config.mapper";
import { ProductBranchConfigEntity } from "../models/product-branch-config.entity";


@Injectable()
export class ProductBranchConfigRepositoryImpl extends ProductBranchConfigRepository {
  constructor(
    @InjectRepository(ProductBranchConfigEntity)
    private readonly repository: Repository<ProductBranchConfigEntity>,
  ) {
    super();
  }

  public async saveMany(configs: ProductBranchConfig[]): Promise<void> {
    // save con un arreglo hace el upsert por la llave primaria de todas las
    // filas dentro de una sola transacción: o se guardan todas o ninguna.
    await this.repository.save(configs.map((config) => ProductBranchConfigMapper.toPersistence(config)));
  }

  public async findByProduct(
    tenantId: string,
    productId: string,
  ): Promise<ProductBranchConfig[]> {
    // El orden explícito hace que la lista salga siempre igual.
    const rows = await this.repository.find({
      where: { tenantId, productId },
      order: { createdAt: "ASC", id: "ASC" },
    });

    return rows.map((row) => ProductBranchConfigMapper.toDomain(row));
  }

  public async deleteMany(
    ids: ProductBranchConfigId[],
    tenantId: string,
  ): Promise<void> {
    // Es una sola sentencia DELETE, así que se borran todas o ninguna. Filtrar
    // también por tenantId evita tocar filas de otro negocio aunque llegue un id ajeno.
    await this.repository.delete({ id: In(ids.map((id) => id.value)), tenantId });
  }
}
