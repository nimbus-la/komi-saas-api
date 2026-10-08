import { Body, Controller, Delete, Get, Patch, Post, Query } from "@nestjs/common";

import { type AuthenticatedUser, CurrentUser } from "@/auth/infrastructure";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { SearchProductsDto } from "./dto/search-products.dto";
import { DeleteProductDto } from "./dto/delete-product.dto";
import { CalculateProfitabilityDto } from "./dto/calculate-profitability.dto";
import { CalculateProfitabilityUseCase, CreateProductUseCase, DeleteProductUseCase, SearchProductsUseCase, UpdateProductUseCase } from "../../application";
import { ProfitMargin } from "../../domain/value-object/profit-margin.value-object";
import { ResponseMessage } from "@/infrastructure";


@Controller("products")
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly calculateProfitabilityUseCase: CalculateProfitabilityUseCase,
  ) { }


  @Post("create")
  @ResponseMessage("Producto creado exitosamente")
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ) {
    const product = await this.createProductUseCase.execute({
      tenantId: user.tenantId,
      productCategoryId: dto.categoryId,
      productName: dto.name,
      productDescription: dto.description,
      productImgUrl: dto.imageUrl,
      productBasePrice: dto.price,
      productCost: dto.cost,
      profitMargin: ProfitMargin.create(dto.targetMargin.toString()),
    });

    return this.findOne(user.tenantId, product.id.value);
  }


  @Patch("update")
  @ResponseMessage("Producto actualizado exitosamente")
  public async update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProductDto,
  ): Promise<void> {
    await this.updateProductUseCase.execute({
      id: dto.productId,
      tenantId: user.tenantId,
      productCategoryId: dto.categoryId,
      productName: dto.name,
      productDescription: dto.description,
      productImgUrl: dto.imageUrl,
      productBasePrice: dto.price,
      productCost: dto.cost,
      status: dto.status,
      // El margen es opcional en una actualización parcial: sin dato no se
      // envía la clave, y el caso de uso conserva el que ya tiene el producto.
      ...(dto.targetMargin !== undefined
        ? { profitMargin: ProfitMargin.create(dto.targetMargin.toString()) }
        : {}),
    });
  }


  @Get()
  public async search(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SearchProductsDto,
  ) {
    const { pageNumber, pageSize, categoryId, ...filters } = query;

    return this.searchProductsUseCase.execute(
      {
        ...filters,
        ...(categoryId !== undefined ? { productCategoryId: categoryId } : {}),
        tenantId: user.tenantId,
      },
      { pageNumber, pageSize },
    );
  }


  @Post("profitability")
  @ResponseMessage("Rentabilidad calculada exitosamente")
  public async profitability(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CalculateProfitabilityDto,
  ) {
    const { cost, price, targetMargin } = dto;

    return this.calculateProfitabilityUseCase.execute({
      tenantId: user.tenantId,
      cost,
      ...(price !== undefined ? { price } : {}),
      ...(targetMargin !== undefined ? { targetMargin } : {}),
    });
  }


  @Delete("delete")
  @ResponseMessage("Producto eliminado exitosamente.")
  public async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DeleteProductDto,
  ): Promise<void> {
    await this.deleteProductUseCase.execute({
      id: dto.productId,
      tenantId: user.tenantId,
      deletedBy: user.userId,
    });
  }


  /** Devuelve el producto ya compuesto (con el nombre de su categoría) tras escribirlo. */
  private async findOne(tenantId: string, productId: string) {
    const { rows } = await this.searchProductsUseCase.execute(
      { tenantId, productId },
      { pageNumber: 1, pageSize: 1 },
    );

    return rows[0];
  }
}
