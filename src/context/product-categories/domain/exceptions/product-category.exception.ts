import { DomainException } from "@/shared";

export class ProductCategoryNotFoundException extends DomainException {
  constructor(id: string) {
    super({
      code: "1441",
      detail: `La categoría con id '${id}' no existe.`,
    });
  }
}


export class ProductCategoryAlreadyExistsException extends DomainException {
  constructor(name: string) {
    super({
      code: "1442",
      detail: `La categoría "${name}" ya existe.`,
    });
  }
}


export class ProductCategoryAlreadyActivatedException extends DomainException {
  constructor() {
    super({
      code: "1443",
      detail: "La categoría ya se encuentra activada.",
    });
  }
}


export class ProductCategoryAlreadyDeactivatedException extends DomainException {
  constructor() {
    super({
      code: "1444",
      detail: "La categoría ya se encuentra desactivada.",
    });
  }
}


export class CategoryNameTooShortException extends DomainException {
  constructor(minLength: number) {
    super({
      code: "1445",
      detail: `El nombre de la categoría debe tener mínimo ${minLength} caracteres.`,
    });
  }
}


export class CategoryNameTooLongException extends DomainException {
  constructor(maxLength: number) {
    super({
      code: "1446",
      detail: `El nombre de la categoría debe tener máximo ${maxLength} caracteres.`,
    });
  }
}


export class TenantNotFoundException extends DomainException {
  constructor(tenantId: string) {
    super({
      code: "1205",
      detail: `No se encontró el tenant con id ${tenantId}.`,
    });
  }
}


export class TenantIdRequiredForSearchException extends DomainException {
  constructor() {
    super({
      code: "1447",
      detail: "El negocio es obligatorio para operar sobre categorías.",
    });
  }
}


export class ProductCategoryDeletedException extends DomainException {
  constructor(id: string) {
    super({
      code: "1449",
      detail: `La categoría con id '${id}' fue eliminada y no se puede modificar.`,
    });
  }
}


export class CategoryHasProductsException extends DomainException {
  constructor(name: string, productCount: number) {
    const products = productCount === 1
      ? "1 producto asociado"
      : `${productCount} productos asociados`;

    super({
      code: "1448",
      detail: `No es posible eliminar la categoría "${name}" porque tiene ${products}. Asígnalos a otra categoría o elimínalos y vuelve a intentarlo.`,
    });
  }
}
