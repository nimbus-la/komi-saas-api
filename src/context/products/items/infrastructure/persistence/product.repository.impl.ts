import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import {
  Product,
  ProductId,
  ProductName,
  ProductRepository,
  ProductResponse,
} from "../../domain";

import { ProductEntity } from "./product.entity";

@Injectable()
export class ProductRepositoryImpl extends ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
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

  public async search(): Promise<ProductResponse[]> {
    const rows = await this.productRepository.find();

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
}