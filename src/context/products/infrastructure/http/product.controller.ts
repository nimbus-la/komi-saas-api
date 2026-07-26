import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { SearchProductsApplicationParams } from "../../domain/types/product-application";
import { CreateProductUseCase, SearchProductsUseCase, UpdateProductUseCase } from "../../application";
import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";
import { ProfitMargin } from "../../domain/value-object/profit-margin.value-object";

@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)

@Controller("products")
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,
  ) { }

  @Post()
  async create(@Body() dto: CreateProductDto) {

    const product = await this.createProductUseCase.execute({
      ...dto,
      profitMargin: ProfitMargin.create(dto.profitMargin.toString())
    });

    const response =
      await this.searchProductsUseCase.execute({
        tenantId: dto.tenantId,
        productId: product.id.value,
        page: 1,
        limit: 1,
      });

    return {
      data: response[0],
    };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ) {

    const product =
      await this.updateProductUseCase.execute({
        id,
        ...dto,
        profitMargin: ProfitMargin.create(
          dto.profitMargin.toString()
        )
      });

    const response =
      await this.searchProductsUseCase.execute({
        tenantId: dto.tenantId,
        productId: product.id.value,
        page: 1,
        limit: 1,
      });

    return {
      data: response[0],
    };
  }

  @Get()
  async search(
    @Query("tenantId") tenantId: string,
    @Query("text") text?: string,
    @Query("productCategoryId") productCategoryId?: string,
    @Query("productStatus") productStatus?: string,
    @Query("page") page = "1",
    @Query("limit") limit = "10",
  ) {
    const params: SearchProductsApplicationParams = {
      tenantId,
      page: Number(page),
      limit: Number(limit),
    };

    if (text) {
      params.text = text;
    }

    if (productCategoryId) {
      params.productCategoryId = productCategoryId;
    }

    if (productStatus !== undefined) {
      params.productStatus = productStatus === "true";
    }
    const products =
      await this.searchProductsUseCase.execute(params);

    return {
      data: products,
    };
  }
}

