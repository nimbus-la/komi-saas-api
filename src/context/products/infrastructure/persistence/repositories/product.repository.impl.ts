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
import { RecipeIngredientEntity } from "../models/recipe-ingredient.entity";
import { InventoryItemEntity } from "@/context/inventory";
import { InventoryItemNotValidForTenantException } from "@/context/products/domain/recipe/exceptions/inventory-item-not-valid-for-tenant.exception";

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
    await this.dataSource.transaction(async (manager) => {

      const productRepository =
        manager.getRepository(ProductEntity);

      const recipeIngredientRepository =
        manager.getRepository(RecipeIngredientEntity);

      const inventoryItemRepository =
        manager.getRepository(InventoryItemEntity);

      // 1. Obtener los datos del producto
      const primitives = product.toPrimitives();

      // 2. Validar cada ingrediente de la receta
      for (const ingredient of primitives.ingredients) {

        const inventoryItem =
          await inventoryItemRepository.findOne({
            where: {
              id: ingredient.inventoryItemId,
              tenantId: primitives.tenantId,
            },
          });

        // Si no existe o pertenece a otro tenant
        if (!inventoryItem) {
          throw new InventoryItemNotValidForTenantException(
            ingredient.inventoryItemId,
            primitives.tenantId,
          );
        }
      }

      // 3. Si todos los ingredientes son válidos,
      // ahora sí guardamos el producto
      const row = productRepository.create(
        ProductMapper.toEntity(product),
      );

      await productRepository.save(row);

      // 4. Guardar los ingredientes de la receta
      if (primitives.ingredients.length > 0) {

        const ingredients =
          primitives.ingredients.map(
            (ingredient) => {

              const entity =
                new RecipeIngredientEntity();

              entity.id =
                ingredient.id;

              entity.productId =
                product.id.value;

              entity.inventoryItemId =
                ingredient.inventoryItemId;

              entity.quantity =
                ingredient.quantity;

              entity.isOptional =
                ingredient.isOptional;

              return entity;
            },
          );

        await recipeIngredientRepository.save(
          ingredients,
        );
      }
    });
  }

  public async update(product: Product): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const productRepository =
        manager.getRepository(ProductEntity);

      const recipeIngredientRepository =
        manager.getRepository(RecipeIngredientEntity);

      const primitives = product.toPrimitives();

      await productRepository.update(
        product.id.value,
        {
          tenantId: primitives.tenantId,
          productCategoryId: primitives.productCategoryId,
          name: primitives.productName,
          description: primitives.productDescription ?? null,
          sku: primitives.productSku,
          imageUrl: primitives.productImgUrl ?? null,
          basePrice: primitives.productBasePrice,
          profitMargin: primitives.profitMargin.toString(),
          isActive: primitives.productStatus,
        },
      );

      await recipeIngredientRepository.delete({
        productId: product.id.value,
      });

      if (primitives.ingredients.length > 0) {
        const ingredients = primitives.ingredients.map(
          (ingredient) => {
            const entity = new RecipeIngredientEntity();

            entity.id = ingredient.id;
            entity.productId = product.id.value;
            entity.inventoryItemId =
              ingredient.inventoryItemId;
            entity.quantity = ingredient.quantity;
            entity.isOptional = ingredient.isOptional;

            return entity;
          },
        );

        await recipeIngredientRepository.save(ingredients);
      }
    });
  }

  public async search(
    params: SearchProductsApplicationParams,
  ): Promise<ProductResponse[]> {
    const query = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect(
        "product.ingredients",
        "ingredient",
      );
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
      relations: {
        ingredients: true,
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