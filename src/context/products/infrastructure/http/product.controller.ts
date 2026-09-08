import { Body, Controller, Get, Patch, Post, Query } from "@nestjs/common";

import { type AuthenticatedUser, CurrentUser } from "@/auth/infrastructure";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { SearchProductsDto } from "./dto/search-products.dto";
import { CreateProductUseCase, SearchProductsUseCase, UpdateProductUseCase } from "../../application";
import { ProfitMargin } from "../../domain/value-object/profit-margin.value-object";
import { ResponseMessage } from "@/infrastructure";


@Controller("products")
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,
  ) { }


  @Post()
  @ResponseMessage("Producto creado exitosamente")
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ) {
    const product = await this.createProductUseCase.execute({
      ...dto,
      tenantId: user.tenantId,
      profitMargin: ProfitMargin.create(dto.profitMargin.toString())
    });

    return this.findOne(user.tenantId, product.id.value);
  }


  @Patch("update")
  @ResponseMessage("Producto actualizado exitosamente")
  public async update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProductDto,
  ) {
    const { productId, profitMargin, ...changes } = dto;

    const product =
      await this.updateProductUseCase.execute({
        ...changes,
        id: productId,
        tenantId: user.tenantId,
        // El margen es opcional en una actualización parcial: sin dato no se
        // envía la clave, y el caso de uso conserva el que ya tiene el producto.
        ...(profitMargin !== undefined
          ? { profitMargin: ProfitMargin.create(profitMargin.toString()) }
          : {}),
      });

    return this.findOne(user.tenantId, product.id.value);
  }


  @Get()
  public async search(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SearchProductsDto,
  ) {
    const { pageNumber, pageSize, ...filters } = query;

    return this.searchProductsUseCase.execute({
      ...filters,
      tenantId: user.tenantId,
      page: pageNumber,
      limit: pageSize,
    });
  }

  
  /** Devuelve el producto ya compuesto (categoría, receta y costos) tras escribirlo. */
  private async findOne(tenantId: string, productId: string) {
    const [product] = await this.searchProductsUseCase.execute({
      tenantId,
      productId,
      page: 1,
      limit: 1,
    });

    return product;
  }
}
