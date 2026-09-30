import { AggregateRoot, BasePriceError, Money } from "@/shared";

import { ProductBranchConfigId } from "./value-objects/product-config-id.value-object";
import { ProductBranchConfigPrimitives } from "./interfaces/product-branch-config.interface";
import { EmptyProductBranchConfigException } from "./exceptions/product-branch-config.exception";


/**
 * Precio y estado de un producto en una sucursal. Un valor en null significa
 * que la sucursal hereda el del producto.
 */
export class ProductBranchConfig extends AggregateRoot<ProductBranchConfigId> {
    private readonly tenantId: string;
    private readonly productId: string;
    private readonly branchId: string;
    private price: Money | null;
    private isAvailable: boolean | null;
    private readonly createdAt: Date;
    private updatedAt: Date;


    private constructor(
        id: ProductBranchConfigId,
        tenantId: string,
        productId: string,
        branchId: string,
        price: Money | null,
        isAvailable: boolean | null,
        createdAt: Date,
        updatedAt: Date
    ) {
        super(id);

        this.tenantId = tenantId;
        this.productId = productId;
        this.branchId = branchId;
        this.price = price;
        this.isAvailable = isAvailable;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }


    public static create(params: {
        tenantId: string,
        productId: string,
        branchId: string,
        price: Money | null,
        isAvailable: boolean | null,
    }): ProductBranchConfig {
        this.ensureValidPrice(params.price);

        if (params.price === null && params.isAvailable === null) {
            throw new EmptyProductBranchConfigException();
        };

        const nowDate = new Date();

        return new ProductBranchConfig(
            ProductBranchConfigId.generate(),
            params.tenantId,
            params.productId,
            params.branchId,
            params.price,
            params.isAvailable,
            nowDate,
            nowDate
        );
    }


    public static fromPrimitives(primitives: ProductBranchConfigPrimitives): ProductBranchConfig {
        const price = primitives.price !== null
            ? Money.of(primitives.price, primitives.currency ?? undefined)
            : null;

        return new ProductBranchConfig(
            ProductBranchConfigId.create(primitives.id),
            primitives.tenantId,
            primitives.productId,
            primitives.branchId,
            price,
            primitives.isAvailable,
            primitives.createdAt,
            primitives.updatedAt
        );
    }


    public toPrimitives(): ProductBranchConfigPrimitives {
        return {
            id: this.id.value,
            tenantId: this.tenantId,
            productId: this.productId,
            branchId: this.branchId,
            price: this.price?.getAmount() ?? null,
            currency: this.price?.currency ?? null,
            isAvailable: this.isAvailable,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }


    /**
     * Money ya rechaza los montos negativos; aquí solo falta el cero. Se usa el
     * mismo error del precio base del producto, así cualquier precio inválido
     * responde con el mismo código.
     */
    private static ensureValidPrice(price: Money | null): void {
        if (price !== null && price.equals(Money.zero(price.currency))) {
            throw new BasePriceError("El precio del producto en la sucursal debe ser mayor que 0.");
        };
    }


    private touch(date: Date = new Date()): void {
        this.updatedAt = date;
    }


    /**
     * Cambia solo las claves presentes; null devuelve ese valor al del producto.
     * La configuración nunca queda vacía: para quitarla se elimina.
     */
    public change(params: { price?: Money | null; isAvailable?: boolean | null }): void {
        const price = params.price !== undefined ? params.price : this.price;
        const isAvailable = params.isAvailable !== undefined ? params.isAvailable : this.isAvailable;

        ProductBranchConfig.ensureValidPrice(price);

        if (price === null && isAvailable === null) {
            throw new EmptyProductBranchConfigException();
        };

        this.price = price;
        this.isAvailable = isAvailable;
        this.touch();
    }


    public getProductId(): string {
        return this.productId;
    }


    public getBranchId(): string {
        return this.branchId;
    }
}
