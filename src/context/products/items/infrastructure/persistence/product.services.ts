import { Injectable } from "@nestjs/common";
import { CreateProductDto } from "../http/dto/create-product.dto";
import { CreateProductUseCase } from "../../application/create-item/create-product.use-case";
import { UpdateProductUseCase } from "../../application/update-item/update-product.use-case";
import { UpdateProductDto } from "../http/dto/update-product.dto";

@Injectable()
export class ProductService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,

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

  async findAll() {
    return [];
  }
}