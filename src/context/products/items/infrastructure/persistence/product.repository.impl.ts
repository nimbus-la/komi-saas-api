import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import {
  Product,
  ProductId,
  ProductName,
  ProductRepository,
  ProductResponse,
  SearchProductsApplicationParams,
} from "../../domain";

import { ProductEntity } from "./product.entity";

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
    const primitives = product.toPrimitives();

    const row = this.productRepository.create({
      id: primitives.id,
      productCategoryId: primitives.productCategoryId,
      name: primitives.productName,
      description: primitives.productDescription ?? null,
      sku: primitives.productSku,
      imageUrl: primitives.productImgUrl ?? null,
      basePrice: primitives.productBasePrice,
      profitMargin: primitives.profitMargin.toString(),
      isActive: primitives.productStatus,
    });

    await this.productRepository.save(row);
  }

  public async update(product: Product): Promise<void> {
    const primitives = product.toPrimitives();

    await this.productRepository.update(primitives.id, {
      productCategoryId: primitives.productCategoryId,
      name: primitives.productName,
      description: primitives.productDescription ?? null,
      sku: primitives.productSku,
      imageUrl: primitives.productImgUrl ?? null,
      basePrice: primitives.productBasePrice,
      profitMargin: primitives.profitMargin.toString(),
      isActive: primitives.productStatus,
    });
  }

  public async search(
    params: SearchProductsApplicationParams,
  ): Promise<ProductResponse[]> {
    const query = this.productRepository.createQueryBuilder("product");

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

    return rows.map((row) => ({
      id: row.id,
      productCategoryId: row.productCategoryId,
      productName: row.name,
      productDescription: row.description ?? undefined,
      productSku: row.sku,
      productImgUrl: row.imageUrl ?? undefined,
      productBasePrice: row.basePrice,
      costCurrency: "COP",
      profitMargin: Number(row.profitMargin),
      productStatus: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  public async existsByName(name: ProductName): Promise<boolean> {
    const count = await this.productRepository
      .createQueryBuilder("product")
      .where("LOWER(product.name) = LOWER(:name)", {
        name: name.value,
      })
      .getCount();

    return count > 0;
  }

  public async findById(id: ProductId): Promise<Product | null> {
    const row = await this.productRepository.findOne({
      where: {
        id: id.value,
      },
    });

    if (!row) {
      return null;
    }

    return Product.fromPrimitives({
      id: row.id,
      productCategoryId: row.productCategoryId,
      productName: row.name,
      productDescription: row.description ?? undefined,
      productSku: row.sku,
      productImgUrl: row.imageUrl ?? undefined,
      productBasePrice: row.basePrice,
      costCurrency: "COP",
      profitMargin: Number(row.profitMargin),
      productStatus: row.isActive,
    });
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