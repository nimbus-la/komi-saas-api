import { DomainEvent } from "@/shared";

export interface ProductDeletedProps {
    productId: string;
    tenantId: string;
    /** Usuario que lo eliminó, tomado del token. */
    deletedBy: string;
}

/**
 * Se eliminó un producto. Nadie lo escucha todavía; queda para que ventas,
 * órdenes y cajas reaccionen cuando existan.
 */
export class ProductDeletedEvent extends DomainEvent {
    public readonly eventName = "product.deleted";

    public readonly productId: string;
    public readonly tenantId: string;
    public readonly deletedBy: string;

    constructor(props: ProductDeletedProps) {
        super();

        this.productId = props.productId;
        this.tenantId = props.tenantId;
        this.deletedBy = props.deletedBy;
    }
}