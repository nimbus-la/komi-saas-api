export class ProductCategoryNotFoundException extends Error {
    constructor(id: string) {
        super(`La categoría con id '${id}' no existe.`);
        this.name = "ProductCategoryNotFoundException";
    }
}