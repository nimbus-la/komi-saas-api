import { Body, Controller, Post } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductService } from "../persistence/product.services";

@Controller("products")
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }
}