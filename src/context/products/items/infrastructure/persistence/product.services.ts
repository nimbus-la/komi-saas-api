import { Injectable } from "@nestjs/common";
import { CreateProductDto } from "../http/dto/create-product.dto";
import { CreateProductUseCase } from "../../application/create-item/create-product.use-case";

@Injectable()
export class ProductService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
  ) {}

  async create(dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);
  }

  async findAll() {
    return [];
  }
}