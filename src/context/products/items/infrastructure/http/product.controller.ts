import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductService } from "../persistence/product.services";

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
}