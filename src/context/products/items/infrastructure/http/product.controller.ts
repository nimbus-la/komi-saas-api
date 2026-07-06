import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductService } from "../persistence/product.services";
import { SearchProductsApplicationParams } from "../../domain";

@Controller("products")
export class ProductController {
  constructor(private readonly service: ProductService) { }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    const product = await this.service.create(dto);

    return {
      statusCode: 201,
      message: "Producto creado con éxito",
      data: product,
    };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ) {
    await this.service.update(id, dto);

    return {
      statusCode: 200,
      message: "Producto actualizado con éxito",
    };
  }
  @Get()
  async search(
    @Query("text") text?: string,
    @Query("productCategoryId") productCategoryId?: string,
    @Query("productStatus") productStatus?: string,
    @Query("page") page = "1",
    @Query("limit") limit = "10",
  ) {
    const params: SearchProductsApplicationParams = {
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

    const products = await this.service.search(params);

    return {
      statusCode: 200,
      message: "Productos obtenidos con éxito",
      data: products,
    };
  }

}

