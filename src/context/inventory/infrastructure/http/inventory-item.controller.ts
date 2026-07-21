import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query, UseFilters, UseInterceptors } from "@nestjs/common";

import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";
import { ConsumeStockUseCase, CreateInventoryItemUseCase, FindInventoryItemUseCase, ReceiveStockUseCase, SearchInventoryItemsUseCase, SearchItemBatchesUseCase, SetMinimumStockUseCase, UpdateInventoryItemUseCase } from "../../application";
import { CreateItemDto } from "./dtos/create-item.dto";
import { ReceiveStockDto } from "./dtos/receive-stock.dto";
import { ConsumeStockDto } from "./dtos/consume-stock.dto";
import { UpdateItemDto } from "./dtos/update-item.dto";
import { SetMinimumStockDto } from "./dtos/set-minimum-stock.dto";
import { RegisterWasteUseCase } from "../../application/use-cases/register-waste/register-waste.use-case";
import { AdjustBatchUseCase } from "../../application/use-cases/adjust-batch/adjust-batch.use-case";
import { CountStockUseCase } from "../../application/use-cases/count-stock/count-stock.use-case";
import { RegisterWasteDto } from "./dtos/register-waste.dto";
import { AdjustBatchDto } from "./dtos/adjust-batch.dto";
import { CountStockDto } from "./dtos/count-stock.dto";


@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller('inventory/item')
export class InventoryItemController {
    constructor(
        private readonly createItem: CreateInventoryItemUseCase,
        private readonly searchItems: SearchInventoryItemsUseCase,
        private readonly findItem: FindInventoryItemUseCase,
        private readonly receiveStock: ReceiveStockUseCase,
        private readonly consumeStock: ConsumeStockUseCase,
        private readonly searchItemBatches: SearchItemBatchesUseCase,
        private readonly updateItem: UpdateInventoryItemUseCase,
        private readonly setMinimumStock: SetMinimumStockUseCase,
        private readonly registerWaste: RegisterWasteUseCase,
        private readonly adjustBatch: AdjustBatchUseCase,
        private readonly countStock: CountStockUseCase,
    ) { };



    @Post()
    public async create(@Body() dto: CreateItemDto): Promise<void> {
        await this.createItem.execute(dto);
    };



    @Get()
    public async list(@Query('branchId') branchId?: string) {
        return this.searchItems.execute(branchId);
    };



    @Get(':id')
    public async find(
        @Param('id') id: string,
    ) {
        return this.findItem.execute(id);
    };



    @Post('receive/:id')
    public async receive(
        @Param('id') id: string,
        @Body() dto: ReceiveStockDto
    ): Promise<void> {
        await this.receiveStock.execute({
            itemId: id,
            branchId: dto.branchId,
            quantityReceived: dto.quantityReceived,
            totalCostAmount: dto.totalCostAmount,
            expirationDate: dto.expirationDate ?? null,
            ...(dto.receivedAt ? { receivedAt: dto.receivedAt } : {}),
        });
    };



    @Post('consume/:id')
    public async consume(
        @Param('id') id: string,
        @Body() dto: ConsumeStockDto
    ): Promise<void> {
        await this.consumeStock.execute({
            itemId: id,
            branchId: dto.branchId,
            quantity: dto.quantity,
            ...(dto.consumedAt ? { consumedAt: dto.consumedAt } : {}),
        });
    };



    /** Merma: producto perdido. Con batchId va a ese lote; sin él, FEFO. */
    @Post('waste/:id')
    public async waste(@Param('id') id: string, @Body() dto: RegisterWasteDto): Promise<void> {
        await this.registerWaste.execute({
            itemId: id,
            branchId: dto.branchId,
            quantity: dto.quantity,
            reason: dto.reason,
            ...(dto.batchId ? { batchId: dto.batchId } : {}),
            ...(dto.occurredAt ? { occurredAt: dto.occurredAt } : {}),
        });
    };



    /** Ajuste de un lote concreto (corrección de captura). */
    @Post('adjust/:id')
    public async adjust(@Param('id') id: string, @Body() dto: AdjustBatchDto): Promise<void> {
        await this.adjustBatch.execute({
            itemId: id,
            batchId: dto.batchId,
            actualQuantity: dto.actualQuantity,
            reason: dto.reason,
            ...(dto.occurredAt ? { occurredAt: dto.occurredAt } : {}),
        });
    };



    /** Conteo físico: cuadra el total del item en una sucursal. */
    @Post('count/:id')
    public async count(@Param('id') id: string, @Body() dto: CountStockDto): Promise<void> {
        await this.countStock.execute({
            itemId: id,
            branchId: dto.branchId,
            actualTotal: dto.actualTotal,
            reason: dto.reason,
            ...(dto.surplusBatchId ? { surplusBatchId: dto.surplusBatchId } : {}),
            ...(dto.occurredAt ? { occurredAt: dto.occurredAt } : {}),
        });
    };



    @Get('batches/:id')
    public async batches(
        @Param('id') id: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageNumber: number,
        @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
        @Query('branchId') branchId?: string,
    ) {
        return this.searchItemBatches.execute(id, { pageNumber, pageSize }, branchId);
    };



    @Patch(':id')
    public async update(
        @Param('id') id: string,
        @Body() dto: UpdateItemDto,
    ): Promise<void> {
        await this.updateItem.execute(id, dto);
    };



    @Patch('minimum-stock/:id')
    public async setMinimum(
        @Param('id') id: string,
        @Body() dto: SetMinimumStockDto,
    ) {
        await this.setMinimumStock.execute({
            itemId: id,
            ...(dto.branchId ? { branchId: dto.branchId } : {}),
            minStock: dto.minStock
        });
    };
};