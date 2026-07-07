import { ProductPrimitives } from "./product-primitives";

export interface ProductResponse extends ProductPrimitives {
    createdAt: Date;
    updatedAt: Date;
}