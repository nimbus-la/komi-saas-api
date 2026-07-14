import { AggregateRoot, Money, Quantity } from "@/shared";

import { ConsumedBatchDetail, InventoryItemPrimitives } from "./types/domain.types";
import { InventoryItemCreatedEvent } from "./events/inventory-item-created.event";
import { AmbiguousBranchScopeException, EmptyUpdateException, InactiveItemException, InsufficientStockException, NonPositiveConsumptionException, PerishabilityChangeNotAllowedException, PerishableRequiresExpirationException, UnitChangeNotAllowedException } from "./exceptions/inventory-item.exceptions";
import { InventoryItemId } from "./value-objects/inventory-item-id.value-object";
import { InventoryItemName } from "./value-objects/inventory-item-name.value-object";
import { InventoryItemUnit } from "./value-objects/inventory-item-unit.value-object";
import { InventoryBatch } from "./entities/inventory-batch/inventory-batch.entity";
import { InventoryBatchExpirationDate } from "./entities/inventory-batch/value-objects/inventory-batch-expiration.value-object";
import { InventoryItemSku } from "./value-objects/inventory-item-sku.value-object";
import { DEFAULT_CURRENCY } from "./common/constants.common";
import { InventoryStock } from "./entities/inventory-stock/inventory-stock.entity";
import { StockReceivedEvent } from "./events/stock-received.event";
import { StockConsumedEvent } from "./events/stock-consumed.event";


export class InventoryItem extends AggregateRoot<InventoryItemId> {
    private readonly tenantId: string;
    private readonly sku: InventoryItemSku;
    private name: InventoryItemName;
    private unitOfMeasure: InventoryItemUnit;
    private batches: InventoryBatch[];
    private isPerishable: boolean;
    private isActive: boolean;
    private minGlobalStock: Quantity | null;
    private stocks: InventoryStock[];
    private readonly createdAt: Date;
    private updatedAt: Date;



    /**
     * Constructor privado; solo se llama desde create() (item nuevo) o
     * fromPrimitives() (rehidratación desde la base). Es privado a propósito, para
     * que nadie construya un item saltándose esas dos puertas y sus reglas.
     */
    private constructor(
        id: InventoryItemId,
        tenantId: string,
        sku: InventoryItemSku,
        name: InventoryItemName,
        unitOfMeasure: InventoryItemUnit,
        isPerishable: boolean,
        isActive: boolean,
        createdAt: Date,
        updatedAt: Date,
        batches: InventoryBatch[],
        minGlobalStock: Quantity | null,
        stocks: InventoryStock[]
    ) {
        super(id);

        this.tenantId = tenantId;
        this.sku = sku;
        this.name = name;
        this.unitOfMeasure = unitOfMeasure;
        this.isPerishable = isPerishable;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.batches = batches;
        this.minGlobalStock = minGlobalStock;
        this.stocks = stocks;
    };



    /**
     * Fábrica para un item NUEVO (nace desde cero, no desde la base).
     * - Genera su id, arranca activo (isActive = true) y sin lotes ([]).
     * - createdAt y updatedAt nacen iguales (al crear, "creado" y "actualizado" son el mismo instante).
     * - Registra el evento de dominio InventoryItemCreatedEvent para que la infraestructura lo publique tras persistir.
     */
    public static create(params: {
        tenantId: string;
        sku: InventoryItemSku;
        name: InventoryItemName;
        unitOfMeasure: InventoryItemUnit;
        isPerishable: boolean;
        createdAt?: Date;
    }): InventoryItem {
        const now = params.createdAt ?? new Date();

        const item = new InventoryItem(
            InventoryItemId.generate(),
            params.tenantId,
            params.sku,
            params.name,
            params.unitOfMeasure,
            params.isPerishable,
            true,
            now,
            now,
            [],
            null,
            []
        );

        item.registerEvent(
            new InventoryItemCreatedEvent({
                itemId: item.id.value,
                tenantId: item.tenantId,
                sku: item.sku.value,
                name: item.name.value,
                unitOfMeasure: item.unitOfMeasure.value,
                isPerishable: item.isPerishable,
                isActive: item.isActive,
                createdAt: now,
                updatedAt: now
            })
        );

        return item;
    };



    /**
     * Recepción de mercancía: registra un nuevo lote dentro del item.
     * Aquí viven dos reglas de negocio (invariantes del item):
     *   1. Un item inactivo no puede recibir mercancía -> InactiveItemException.
     *   2. Un item perecedero exige fecha de vencimiento -> PerishableRequiresExpirationException.
     * Si el item NO es perecedero, se ignora cualquier vencimiento y el lote se
     * crea con expiration = null. Al final marca el item como actualizado (touch).
     */
    public recivedBatch(params: {
        branchId: string;
        quantityReceived: Quantity;
        unitCost: Money;
        expirationDate: InventoryBatchExpirationDate | null;
        receivedAt?: Date
    }) {
        if (!this.isActive) {
            throw new InactiveItemException(this.id.value);
        };

        if (this.isPerishable && params.expirationDate === null) {
            throw new PerishableRequiresExpirationException(this.id.value);
        };

        const batch = InventoryBatch.create({
            branchId: params.branchId,
            quantityReceived: params.quantityReceived,
            unitCost: params.unitCost,
            expirationDate: this.isPerishable ? params.expirationDate : null,
            ...(params.receivedAt ? { receivedAt: params.receivedAt } : {}),
        });

        this.batches.push(batch);

        this.registerEvent(
            new StockReceivedEvent({
                itemId: this.id.value,
                tenantId: this.tenantId,
                branchId: params.branchId,
                batchId: batch.getId(),
                quantity: params.quantityReceived.getValue(),
                unitCostAmount: params.unitCost.getAmount(),
                unitCostCurrency: params.unitCost.currency,
                occurredOn: params.receivedAt ?? new Date()
            })
        );

        this.touch();
    };



    /**
     * Descuenta 'quantity' del inventario del item aplicando FEFO.
     * Flujo:
     *   1. No se permite consumir cero o menos -> NonPositiveConsumptionException.
     *   2. Verifica que haya stock suficiente sumando los lotes activos; si no,
     *      -> InsufficientStockException (no deja el inventario en negativo).
     *   3. Ordena los lotes activos por FEFO (vence primero, sale primero) y va
     *      descontando de uno en uno: de cada lote toma lo que pueda ('take') hasta
     *      cubrir la cantidad pedida ('pending' llega a cero).
     *   4. Marca el item como actualizado (touch).
     * 'take' = min(pendiente, restante del lote): nunca saca de un lote más de lo
     * que tiene; si un lote no alcanza, sigue con el siguiente.
     */
    public consume(quantity: Quantity, date: Date = new Date()): void {
        // Consumir exige que el agregado venga cargado con lotes de UNA sola
        // sucursal; si hay varias (carga consolidada), no sabemos de qué sede
        // descontar. De paso capturamos esa única sede para el evento.
        const activeBranches = new Set(
            this.batches
                .filter((batch: InventoryBatch) => batch.isActive(date))
                .map((batchMap: InventoryBatch) => batchMap.getBranchId())
        );


        if (activeBranches.size > 1) {
            throw new AmbiguousBranchScopeException(this.id.value);
        };


        // Un Set es iterable: la desestructuración toma su primer elemento.
        // Tras el guard solo hay dos casos: una sede (normal) o ninguna (sin
        // lotes activos). El tipo queda string | undefined por el segundo caso.
        const [scopeBranchId] = activeBranches;


        if (quantity.isZero()) {
            throw new NonPositiveConsumptionException();
        };


        const available = this.currentStock(date);


        if (quantity.isGreaterThan(available)) {
            throw new InsufficientStockException(this.id.value, quantity.getValue(), available.getValue());
        };

        // NOTA: si no había lotes activos, available era cero y el guard anterior
        // ya lanzó. Por lo tanto, de aquí en adelante scopeBranchId SIEMPRE tiene
        // valor; el chequeo de undefined de abajo solo existe porque TypeScript
        // no puede deducir ese razonamiento.


        // Ordena los lotes activos por FEFO (vence primero, sale primero) y va
        // descontando de uno en uno. De cada lote registra cuánto se tomó y a qué
        // costo, para que el movimiento quede con trazabilidad y costeo por lote.
        const ordered = this.batches
            .filter((batch) => batch.isActive(date))
            .sort(InventoryItem.compararPorFefo);


        let pending = quantity;
        const consumedBatches: ConsumedBatchDetail[] = [];


        for (const batch of ordered) {
            if (pending.isZero()) break;

            // De este lote se toma lo que falte, sin exceder lo que le queda.
            const take = pending.isGreaterThan(batch.getRemaining())
                ? batch.getRemaining()
                : pending;

            batch.consume(take);

            consumedBatches.push({
                batchId: batch.getId(),
                quantity: take.getValue(),
                unitCostAmount: batch.getUnitCost().getAmount(),
                unitCostCurrency: batch.getUnitCost().currency,
            });

            pending = pending.subtract(take);
        };


        if (scopeBranchId !== undefined) {
            this.registerEvent(
                new StockConsumedEvent({
                    itemId: this.id.value,
                    tenantId: this.tenantId,
                    branchId: scopeBranchId,
                    quantity: quantity.getValue(),
                    consumedBatches,
                    occurredOn: date,
                })
            );
        };

        this.touch();
    };


    /**
     * Devuelve el stock disponible del item: la SUMA de la cantidad restante de
     * todos los lotes activos (no vencidos, no agotados) a la fecha 'date'.
     * Es un valor DERIVADO, no almacenado: siempre refleja los lotes reales, así
     * que nunca se desincroniza. El parámetro 'date' permite calcular el stock a
     * una fecha dada (útil para pruebas o reportes históricos).
     */
    public currentStock(date: Date = new Date()): Quantity {
        return this.batches
            .filter((batch) => batch.isActive(date))
            .reduce((total, batch) => total.add(batch.getRemaining()), Quantity.zero());
    };



    /**
     * Fija (o limpia con null) el mínimo GLOBAL del item: el umbral por defecto
     * que aplica a toda sucursal que no tenga un override propio.
     */
    public setGlobalMinimum(minStock: Quantity | null): void {
        this.minGlobalStock = minStock;
        this.touch();
    };



    /**
     * Crea o actualiza el OVERRIDE de mínimo de una sucursal concreta. A partir de
     * aquí esa sede deja de derivar del global y usa su propio umbral. Es un upsert:
     * si ya existía un override para la sucursal, se actualiza; si no, se agrega.
     */
    public setBranchMinimum(branchId: string, minStock: Quantity): void {
        const existing = this.stocks.find(
            (stock: InventoryStock) => stock.getBranchId() === branchId
        );

        if (existing !== undefined) {
            existing.changeMinimum(minStock);

        } else {
            this.stocks.push(InventoryStock.create({ branchId, minStock }));
        };

        this.touch();
    };



    /**
     * Mínimo EFECTIVO para una sucursal, el override de la sede si existe; si no,
     * el mínimo global; si tampoco hay global, null (el item no tiene política de
     * mínimos y nunca se reporta "bajo mínimo").
     */
    public minimumStockFor(branchId: string): Quantity | null {
        const override = this.stocks.find(
            (stock: InventoryStock) => stock.getBranchId() === branchId
        );

        return override ? override.getMinStock() : this.minGlobalStock;
    };



    /**
     * Stock disponible (derivado de lotes activos) de UNA sucursal a la fecha dada.
     * Igual que currentStock() pero acotado a una sede; útil cuando el agregado se
     * cargó con lotes de varias sucursales.
     */
    public currentStockForBranch(branchId: string, date: Date = new Date()): Quantity {
        return this.batches
            .filter((batch) => batch.isActive(date) && batch.getBranchId() === branchId)
            .reduce((total, batch) => total.add(batch.getRemaining()), Quantity.zero());
    };



    /**
     * ¿La sucursal está por debajo de su mínimo efectivo a la fecha dada?
     * Devuelve null cuando no hay política aplicable (ni override ni global): no se
     * puede afirmar nada. "Bajo mínimo" es estricto: stock == mínimo NO cuenta.
     */
    public isBelowMinimumFor(branchId: string, date: Date = new Date()): boolean | null {
        const minimum = this.minimumStockFor(branchId);

        if (minimum === null) return null;

        return minimum.isGreaterThan(this.currentStockForBranch(branchId, date));
    };



    /**
     * Costo unitario promedio PONDERADO de lo que hay en bodega, a la fecha 'date'.
     * Pondera por cantidad restante: los lotes con más existencias pesan más en el
     * promedio (no es un promedio simple de precios). Fórmula:
     *   Σ(costo restante de cada lote) / Σ(cantidad restante).
     * Devuelve null si no hay lotes activos (no hay costo real que reportar; en ese
     * caso quien llame puede caer al costo estándar del item como referencia).
     */
    public weightedAverageCost(date: Date = new Date()): Money | null {
        const active = this.batches.filter(
            (batch: InventoryBatch) => batch.isActive(date)
        );

        if (active.length === 0) return null;

        let totalValue = Money.zero(DEFAULT_CURRENCY);
        let totalQuantity = Quantity.zero();

        for (const batch of active) {
            totalValue = totalValue.add(batch.remainingCost());
            totalQuantity = totalQuantity.add(batch.getRemaining());
        };

        return totalQuantity.isZero() ? null : totalValue.divide(totalQuantity.getValue());
    };


    /**
     * Comparador FEFO para ordenar lotes: "el que vence primero, sale primero".
     * Recibe dos lotes (loteA, loteB) y devuelve un número que le dice a .sort()
     * cuál debe ir primero:
     *   - negativo  -> loteA va antes que loteB
     *   - positivo  -> loteA va después que loteB
     *   - cero      -> es indiferente
     */
    private static compararPorFefo(loteA: InventoryBatch, loteB: InventoryBatch): number {
        const vencimientoA = loteA.getExpiration();
        const vencimientoB = loteB.getExpiration();

        // Caso 1: ambos lotes son perecederos (tienen fecha de vencimiento).
        // Ordenamos por vencimiento: el que caduca antes debe consumirse primero.
        if (vencimientoA !== null && vencimientoB !== null) {
            return vencimientoA.getTime() - vencimientoB.getTime();
        };

        // Caso 2: al menos uno no tiene vencimiento (no perecedero).
        // Ordenamos por fecha de recepción: el que entró primero sale primero (FIFO).
        return loteA.getReceivedAt().getTime() - loteB.getReceivedAt().getTime();
    };



    /**
     * Marca el item como actualizado, fijando updatedAt. Se llama desde CADA
     * operación que muta el estado (recivedBatch, consume, activate, desactivate),
     * centralizando en un solo lugar el "sello de última modificación".
     * OJO: no se llama en fromPrimitives(): al rehidratar desde la base, updatedAt
     * debe conservar el valor guardado, no pisarse con "ahora".
     */
    private touch(date: Date = new Date()): void {
        this.updatedAt = date;
    };



    /**
     * Actualiza los datos editables del item (actualización parcial: solo cambia
     * lo que venga definido). Reglas:
     *   - name y costAmount: siempre editables (datos de catálogo).
     *   - unitOfMeasure e isPerishable: solo si el item AÚN NO tiene lotes; si ya
     *     los tiene, cambiarlos corrompería las cantidades/vencimientos existentes.
     *   - sku, fechas: inmutables, no se tocan aquí.
     * Marca el item como actualizado (touch).
     */
    public update(params: {
        name?: InventoryItemName;
        unitOfMeasure?: InventoryItemUnit;
        isPerishable?: boolean;
    }) {
        const hasChanges =
            params.name !== undefined ||
            params.unitOfMeasure !== undefined ||
            params.isPerishable !== undefined;

        if (!hasChanges) {
            throw new EmptyUpdateException(this.id.value);
        };

        if (params.name !== undefined) {
            this.name = params.name;
        };

        if (params.unitOfMeasure !== undefined) {
            if (this.batches.length > 0) {
                throw new UnitChangeNotAllowedException(this.id.value);
            };

            this.unitOfMeasure = params.unitOfMeasure;
        };

        if (params.isPerishable !== undefined) {
            if (this.batches.length > 0) {
                throw new PerishabilityChangeNotAllowedException(this.id.value);
            };

            this.isPerishable = params.isPerishable;
        };

        this.touch();
    };



    /**
     * Desactiva el item (baja lógica / soft-state): deja de estar disponible para
     * usarse, pero no se borra ni pierde su historial de lotes.
     * Lanza si ya estaba inactivo (evita desactivar dos veces). Marca actualización.
     * NOTA: "inactivo" (decisión manual) es distinto de "agotado" (sin stock);
     * pueden coexistir.
     */
    public desactivate(): void {
        if (!this.isActive) {
            throw new Error('El item se encuentra desactivado.');
        };

        this.isActive = false;
        this.touch();
    };



    /**
     * Reactiva un item previamente desactivado, devolviéndolo a disponible.
     * Lanza si ya estaba activo. Marca actualización.
     */
    public activate(): void {
        if (this.isActive) {
            throw new Error('El item se encuentra activado.');
        };

        this.isActive = true;
        this.touch();
    };



    /**
     * Serializa el agregado a un objeto plano (primitivas): tipos simples listos
     * para persistir o enviar por HTTP. Los value objects se reducen a su valor
     * (id.value, name.value, Money -> amount + currency) y los lotes se mapean con
     * su propio toPrimitives(). Es la salida del dominio hacia el exterior.
     */
    public toPrimitives(): InventoryItemPrimitives {
        return {
            id: this.id.value,
            tenantId: this.tenantId,
            sku: this.sku.value,
            name: this.name.value,
            unitOfMeasure: this.unitOfMeasure.value,
            isPerishable: this.isPerishable,
            isActive: this.isActive,
            minGlobalStock: this.minGlobalStock ? this.minGlobalStock.getValue() : null,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            batches: this.batches.map((batch) => batch.toPrimitives()),
            stocks: this.stocks.map((stock) => stock.toPrimitives()),
        };
    };



    /**
     * Reconstruye (rehidrata) un item desde sus primitivas, típicamente al leerlo
     * de la base. Hace lo inverso a toPrimitives: reconstruye los value objects y
     * los lotes a partir de los datos planos.
     * No registra eventos ni llama a touch(): no es una operación de negocio, solo
     * "vuelve a armar" un item que ya existía tal como estaba guardado.
     */
    public static fromPrimitives(p: InventoryItemPrimitives): InventoryItem {
        return new InventoryItem(
            InventoryItemId.create(p.id),
            p.tenantId,
            InventoryItemSku.fromValue(p.sku),
            InventoryItemName.create(p.name),
            InventoryItemUnit.create(p.unitOfMeasure),
            p.isPerishable,
            p.isActive,
            p.createdAt,
            p.updatedAt,
            p.batches.map((batch) => InventoryBatch.fromPrimitives(batch)),
            p.minGlobalStock !== null ? Quantity.of(p.minGlobalStock) : null,
            p.stocks.map((stock) => InventoryStock.fromPrimitives(stock)),
        );
    };
};