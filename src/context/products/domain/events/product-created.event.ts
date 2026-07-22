import { DomainEvent } from "@/shared";
import { ProductCreatedProps } from "../types/product-events";

export class ProductCreatedEvent extends DomainEvent {
    public readonly eventName = 'product.created';

    public readonly tenantId: string;
    public readonly productCategoryId: string;
    public readonly productName: string;
    public readonly productSku: string;
    public readonly productDescription: string | undefined;
    public readonly productImgUrl: string | undefined;
    public readonly productBasePrice: string;
    public readonly costCurrency: string;
    public readonly profitMargin: number;
    public readonly productStatus: boolean;

    constructor(props: ProductCreatedProps) {
        super();

        this.tenantId = props.tenantId;
        this.productCategoryId = props.productCategoryId;
        this.productName = props.productName;
        this.productDescription = props.productDescription;
        this.productSku = props.productSku;
        this.productImgUrl = props.productImgUrl;
        this.productBasePrice = props.productBasePrice;
        this.costCurrency = props.costCurrency;
        this.profitMargin = props.profitMargin;
        this.productStatus = props.productStatus;
    }
}