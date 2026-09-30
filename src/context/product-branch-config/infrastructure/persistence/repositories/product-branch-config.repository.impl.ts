import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

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

  public async findByProductAndBranch(
    tenantId: string,
    productId: string,
    branchId: string,
  ): Promise<ProductBranchConfig | null> {
    const row = await this.repository.findOne({
      where: { tenantId, productId, branchId },
    });

    return row ? ProductBranchConfigMapper.toDomain(row) : null;
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

  public async delete(
    id: ProductBranchConfigId,
    tenantId: string,
  ): Promise<void> {
    await this.repository.delete({ id: id.value, tenantId });
  }
}
