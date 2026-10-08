import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Not, Repository } from "typeorm";
import { Paginated, Pagination } from "@/interfaces";
import { EntityStatus, VISIBLE_ENTITY_STATUSES } from "@/shared";
import { ProductEntity } from "../models/product.entity";
import { SearchProductsFilters } from "../../../domain/interfaces/product-application";
import { ProductResponse } from "../../../domain/interfaces/product.response";
import { ProductName } from "../../../domain/value-object/product-name.value-object";
import { ProductId } from "../../../domain/value-object/product-id.value-object";
import { ProductMapper } from "../mappers/products-mapper";
import { RecipeIngredientEntity } from "../models/recipe-ingredient.entity";
import { ProductBranchConfigEntity } from "@/context/product-branch-config/infrastructure/persistence/models/product-branch-config.entity";

import {
  Product,
  ProductRepository,
  SkuSequenceNotGeneratedException,
} from "../../../domain";


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

      const primitives = product.toPrimitives();

      const row = productRepository.create(
        ProductMapper.toEntity(product),
      );

      await productRepository.save(row);

      if (primitives.ingredients.length > 0) {

        const ingredients = ProductMapper.mapIngredients(
          product.id.value,
          primitives.ingredients,
        );

        await recipeIngredientRepository.save(ingredients);
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
          status: primitives.status,
        },
      );

      if (primitives.ingredients.length > 0) {

        await recipeIngredientRepository.delete({
          productId: product.id.value,
        });

        const ingredients = ProductMapper.mapIngredients(
          product.id.value,
          primitives.ingredients,
        );

        await recipeIngredientRepository.save(ingredients);
      }
    });
  }

  public async search(
    filters: SearchProductsFilters,
    pagination: Pagination,
  ): Promise<Paginated<ProductResponse>> {
    const query = this.productRepository
      .createQueryBuilder("product")
      .where(
        "product.tenantId = :tenantId",
        {
          tenantId: filters.tenantId,
        },
      );

    // Buscar un producto específico por id
    if (filters.productId) {
      query.andWhere(
        "product.id = :productId",
        {
          productId: filters.productId,
        },
      );
    }

    const text = filters.text?.trim();

    // Nombre o SKU
    if (text) {
      query.andWhere(
        `(LOWER(product.name) LIKE LOWER(:text)
          OR LOWER(product.sku) LIKE LOWER(:text))`,
        {
          text: `%${ProductRepositoryImpl.escapeLike(text)}%`,
        },
      );
    }

    if (filters.productCategoryId) {
      query.andWhere(
        "product.productCategoryId = :categoryId",
        {
          categoryId: filters.productCategoryId,
        },
      );
    }

    // TypeORM no traduce las propiedades en un join sin relación, por eso van
    // los nombres de las columnas.
    if (filters.branchId !== undefined) {
      query.leftJoin(
        ProductBranchConfigEntity,
        "config",
        `config.product_id = product.product_id
          AND config.branch_id = :branchId
          AND config.tenant_id = :tenantId`,
        {
          branchId: filters.branchId,
        },
      );
    }

    // Sin filtro de estado salen los activos y los pausados; los eliminados
    // nunca aparecen en un listado.
    if (filters.status !== undefined) {
      query.andWhere("product.status = :status", { status: filters.status });
    } else {
      query.andWhere("product.status IN (:...visibleStatuses)", {
        visibleStatuses: [...VISIBLE_ENTITY_STATUSES],
      });
    }

    // El orden explícito es lo que hace que paginar sea estable: sin ORDER BY,
    // Postgres puede devolver las filas en otro orden en cada página y un mismo
    // producto sale repetido en una y se pierde en la otra. El id desempata
    // porque varios productos comparten createdAt (el seed los crea de golpe).
    query
      .orderBy("product.createdAt", "DESC")
      .addOrderBy("product.id", "DESC")
      .skip((pagination.pageNumber - 1) * pagination.pageSize)
      .take(pagination.pageSize);

    const [rows, total] = await query.getManyAndCount();

    const recipeIngredientRepository =
      this.dataSource.getRepository(RecipeIngredientEntity);

    const recipeIngredients =
      await recipeIngredientRepository.find({
        where: {
          productId: In(rows.map((row) => row.id)),
        },
      });

    const ingredientsByProduct = new Map<
      string,
      RecipeIngredientEntity[]
    >();

    for (const ingredient of recipeIngredients) {
      const list =
        ingredientsByProduct.get(ingredient.productId) ?? [];

      list.push(ingredient);

      ingredientsByProduct.set(
        ingredient.productId,
        list,
      );
    }

    const branchConfigs = filters.branchId !== undefined
      ? await this.findBranchConfigs(
        filters.tenantId,
        filters.branchId,
        rows.map((row) => row.id),
      )
      : new Map<string, ProductBranchConfigEntity>();

    return {
      rows: rows.map((row) =>
        ProductMapper.toResponse(
          row,
          ProductMapper.toIngredientsResponse(
            ingredientsByProduct.get(row.id) ?? [],
          ),
          branchConfigs.get(row.id),
        ),
      ),
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      total,
    };
  }

  /** Configuraciones de la sucursal para los productos de la página, por producto. */
  private async findBranchConfigs(
    tenantId: string,
    branchId: string,
    productIds: string[],
  ): Promise<Map<string, ProductBranchConfigEntity>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const configs = await this.dataSource
      .getRepository(ProductBranchConfigEntity)
      .find({
        where: {
          tenantId,
          branchId,
          productId: In(productIds),
        },
      });

    return new Map(configs.map((config) => [config.productId, config]));
  }


  /**
   * Neutraliza los comodines del LIKE dentro del texto que escribe el usuario.
   *
   * Sin esto, buscar "50%" trae todo lo que empiece por "50" y un "_" cualquiera
   * hace de comodín de un carácter: el filtro devuelve de más y el usuario no
   * entiende por qué. La barra invertida es el escape por defecto del LIKE en
   * Postgres, así que no hace falta cláusula ESCAPE.
   */
  private static escapeLike(text: string): string {
    return text.replace(/[\\%_]/g, (character) => `\\${character}`);
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
      // El nombre de un producto eliminado queda libre para uno nuevo.
      .andWhere("product.status <> :deleted", {
        deleted: EntityStatus.Deleted,
      })
      .getCount();

    return count > 0;
  }

  public async findById(
    id: ProductId,
    tenantId: string,
  ): Promise<Product | null> {
    const row = await this.productRepository.findOne({
      // Un producto eliminado se trata como inexistente.
      where: {
        id: id.value,
        tenantId,
        status: Not(EntityStatus.Deleted),
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
      throw new SkuSequenceNotGeneratedException();
    }

    return Number(first.n);
  }
}