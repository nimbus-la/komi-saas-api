import { DomainException } from "@/shared";

export class ProductCategoryNotFoundException extends DomainException {
  constructor(id: string) {
    super({
      code: "1434",
      detail: `La categoría con id '${id}' no existe.`,
    });
  }
}
export class ProductCategoryAlreadyExistsException extends DomainException {
  constructor(name: string) {
    super({
      code: "1435",
      detail: `La categoría "${name}" ya existe.`,
    });
  }
}

export class ProductCategoryAlreadyActivatedException extends DomainException {
  constructor() {
    super({
      code: "1436",
      detail: "La categoría ya se encuentra activada.",
    });
  }
}

export class ProductCategoryAlreadyDeactivatedException extends DomainException {
  constructor() {
    super({
      code: "1437",
      detail: "La categoría ya se encuentra desactivada.",
    });
  }
}

export class CategoryNameTooShortException extends DomainException {
  constructor(minLength: number) {
    super({
      code: "1438",
      detail: `El nombre de la categoría debe tener mínimo ${minLength} caracteres.`,
    });
  }
}

export class CategoryNameTooLongException extends DomainException {
  constructor(maxLength: number) {
    super({
      code: "1439",
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