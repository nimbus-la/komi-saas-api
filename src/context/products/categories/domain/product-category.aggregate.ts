export class ProductCategory {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description?: string,
        public readonly isActive: boolean = true,
    ) { }

    static create(params: {
        id: string;
        name: string;
        description?: string | undefined;
        estado?: boolean | undefined;
    }) {
        return new ProductCategory(
            params.id,
            params.name,
            params.description,
            true,
        );
    }
}