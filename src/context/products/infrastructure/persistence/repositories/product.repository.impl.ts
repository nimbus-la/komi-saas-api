import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import {
  Product,
  ProductRepository,
} from "../../../domain";

import { ProductEntity } from "../models/product.entity";
import { SearchProductsApplicationParams } from "../../../domain/types/product-application";
import { ProductResponse } from "../../../domain/types/product.response";
import { ProductName } from "../../../domain/value-object/product-name.value-object";
import { ProductId } from "../../../domain/value-object/product-id.value-object";
import { CreateProductUseCase, SearchProductsUseCase, UpdateProductUseCase } from "@/context/products/application";
import { CreateProductDto } from "../../http/dto/create-product.dto";
import { UpdateProductDto } from "../../http/dto/update-product.dto";
import { ProductMapper } from "../mappers/products-mapper";

@Injectable()
export class ProductService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,

  ) { }

  async create(dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);

  }
  async update(id: string, dto: UpdateProductDto) {
    return this.updateProductUseCase.execute({
      id,
      ...dto,
    });
  }

  async search(params: SearchProductsApplicationParams) {
    return this.searchProductsUseCase.execute(params);
  }
  async findAll() {
    return [];
  }
}

@Injectable()
export class ProductRepositoryImpl extends ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  public async save(product: Product): Promise<void> {

    const row = this.productRepository.create(
      ProductMapper.toEntity(product)
    );

    await this.productRepository.save(row);
  }

  public async update(product: Product): Promise<void> {

    await this.productRepository.update(
      product.id.value,
      ProductMapper.toEntity(product)
    );

  }

  public async search(
    params: SearchProductsApplicationParams,
  ): Promise<ProductResponse[]> {
    const query = this.productRepository.createQueryBuilder("product");

    // Filtrar siempre por tenant
    query.andWhere(
      "product.tenantId = :tenantId",
      {
        tenantId: params.tenantId,
      },
    );

    // Buscar por nombre o SKU
    if (params.text) {
      query.andWhere(
        `(LOWER(product.name) LIKE LOWER(:text)
          OR LOWER(product.sku) LIKE LOWER(:text))`,
        {
          text: `%${params.text}%`,
        },
      );
    }

    // Filtrar por categoría
    if (params.productCategoryId) {
      query.andWhere(
        "product.productCategoryId = :categoryId",
        {
          categoryId: params.productCategoryId,
        },
      );
    }

    // Filtrar por estado
    if (params.productStatus !== undefined) {
      query.andWhere(
        "product.isActive = :status",
        {
          status: params.productStatus,
        },
      );
    }

    // Paginación
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    query.skip((page - 1) * limit);
    query.take(limit);

    const rows = await query.getMany();

    return rows.map(ProductMapper.toResponse);
  }

  public async existsByName(
    name: ProductName,
    tenantId: string,
  ): Promise<boolean> {
    const count = await this.productRepository
      .createQueryBuilder("product")
      .where("LOWER(product.name) = LOWER(:name)", {
        name: name.value,
      })
      .andWhere("product.tenantId = :tenantId", {
        tenantId,
      })
      .getCount();

    return count > 0;
  }

  public async findById(
    id: ProductId,
    tenantId: string,
  ): Promise<Product | null> {
    const row = await this.productRepository.findOne({
      where: {
        id: id.value,
        tenantId,
      },
    });

    if (!row) {
      return null;
    }

    return ProductMapper.toDomain(row);
  }

  public async nextSkuSequence(): Promise<number> {
    const rows: Array<{ n: string }> = await this.dataSource.query(
      "SELECT nextval('product_sku_seq') AS n",
    );

    const first = rows[0];

    if (first === undefined) {
      throw new Error(
        "No se pudo obtener el siguiente valor de la secuencia de SKU.",
      );
    }

    return Number(first.n);
  }
}