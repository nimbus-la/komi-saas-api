import { EventPublisher } from "@/shared";

import { ProductRepository, DeleteProductApplicationParams, TenantNotFoundException, ProductId, ProductNotFoundException } from "../../../domain";
import { TenantChecker } from "../../ports/tenant-checker";


export class DeleteProductUseCase {
    constructor(
        private readonly repository: ProductRepository,
        private readonly tenantChecker: TenantChecker,
        private readonly eventPublisher: EventPublisher,
    ) { }

    public async execute(params: DeleteProductApplicationParams): Promise<void> {
        const tenantExists = await this.tenantChecker.exists(params.tenantId);

        if (!tenantExists) {
            throw new TenantNotFoundException(params.tenantId);
        }

        const product = await this.repository.findById(
            ProductId.create(params.id),
            params.tenantId
        );

        if (!product) {
            throw new ProductNotFoundException(params.id);
        }

        product.delete(params.deletedBy);

        await this.repository.update(product);
        await this.eventPublisher.publish(product.getDomainEvents());

        product.clearDomainEvents();
    }
}