export class ProductCategoryUpdatedEvent {
    constructor(
        public readonly id: string,
        public readonly name: string,
    ) { }
}