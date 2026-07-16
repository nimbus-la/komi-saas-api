export class ProductCategory {
    constructor(
        public id: string,
        public name: string,
        public description?: string,
        public isActive: boolean = true,
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