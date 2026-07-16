import { DomainException } from "@/shared";

export class RecipeAlreadyExistsException extends DomainException {
  constructor(productId: string) {
    super({
      code: "2300",
      detail: `La receta para el producto ${productId} ya se encuentra registrada.`,
    });
  }
}