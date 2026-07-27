import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query, UseFilters, UseInterceptors } from "@nestjs/common";

import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";
import { ConsumeStockUseCase, CreateInventoryItemUseCase, FindInventoryItemUseCase, ReceiveStockUseCase, SearchInventoryItemsUseCase, SearchItemBatchesUseCase, SetGlobalMinimumStockUseCase, SetBranchMinimumStockUseCase, UpdateInventoryItemUseCase } from "../../application";
import { CreateItemDto } from "./dtos/create-item.dto";
import { ReceiveStockDto } from "./dtos/receive-stock.dto";
import { ConsumeStockDto } from "./dtos/consume-stock.dto";
import { UpdateItemDto } from "./dtos/update-item.dto";
import { SetGlobalMinimumStockDto } from "./dtos/set-global-minimum-stock.dto";
import { SearchInventoryItemsDto } from "./dtos/search-items.dto";
import { SetBranchMinimumStockDto } from "./dtos/set-branch-minimum-stock.dto";
import { RegisterWasteUseCase } from "../../application/use-cases/register-waste/register-waste.use-case";
import { CountStockUseCase } from "../../application/use-cases/count-stock/count-stock.use-case";
import { RegisterWasteDto } from "./dtos/register-waste.dto";
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
        private readonly globalMinimumStock: SetGlobalMinimumStockUseCase,
        private readonly branchMinimumStock: SetBranchMinimumStockUseCase,
        private readonly registerWaste: RegisterWasteUseCase,
        private readonly countStock: CountStockUseCase,
    ) { };



    @Post()
    public async create(@Body() dto: CreateItemDto): Promise<void> {
        await this.createItem.execute(dto);
    };



    @Get()
    public async list(@Query() query: SearchInventoryItemsDto) {
        const { tenantId, branchId, pageNumber, pageSize } = query;

        return this.searchItems.execute(tenantId, { pageNumber, pageSize }, branchId);
    };



    @Get(':id')
    public async find(
        @Param('id') id: string,
        @Query('tenantId') tenantId: string,
        @Query('branchId') branchId?: string,
    ) {
        return this.findItem.execute(id, tenantId, branchId);
    };



    @Post('receive/:id')
    public async receive(
        @Param('id') id: string,
        @Body() dto: ReceiveStockDto
    ): Promise<void> {
        await this.receiveStock.execute({
            itemId: id,
            tenantId: dto.tenantId,
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
            tenantId: dto.tenantId,
            branchId: dto.branchId,
            quantity: dto.quantity,
            ...(dto.consumedAt ? { consumedAt: dto.consumedAt } : {}),
        });
    };



    /** Merma por cantidad total: FEFO reparte entre lotes. */
    @Post('waste/:id')
    public async waste(@Param('id') id: string, @Body() dto: RegisterWasteDto): Promise<void> {
        await this.registerWaste.execute({
            itemId: id,
            tenantId: dto.tenantId,
            branchId: dto.branchId,
            quantity: dto.quantity,
            reason: dto.reason,
            ...(dto.occurredAt ? { occurredAt: dto.occurredAt } : {}),
        });
    };



    /** Conteo físico: cuadra el total del item en una sucursal (solo hacia abajo). */
    @Post('count/:id')
    public async count(@Param('id') id: string, @Body() dto: CountStockDto): Promise<void> {
        await this.countStock.execute({
            itemId: id,
            tenantId: dto.tenantId,
            branchId: dto.branchId,
            actualTotal: dto.actualTotal,
            reason: dto.reason,
            ...(dto.occurredAt ? { occurredAt: dto.occurredAt } : {}),
        });
    };



    @Get('batches/:id')
    public async batches(
        @Param('id') id: string,
        @Query('tenantId') tenantId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageNumber: number,
        @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
        @Query('branchId') branchId?: string,
    ) {
        return this.searchItemBatches.execute(id, tenantId, { pageNumber, pageSize }, branchId);
    };



    @Patch(':id')
    public async update(
        @Param('id') id: string,
        @Body() dto: UpdateItemDto,
    ): Promise<void> {
        await this.updateItem.execute(id, dto.tenantId, dto);
    };



    /**
     * Minimo GLOBAL del item: aplica a toda sucursal sin override propio.
     * No toca los overrides existentes. minStock null lo limpia.
     */
    @Patch('minimum/global/:id')
    public async setGlobalMinimumStock(
        @Param('id') id: string,
        @Body() dto: SetGlobalMinimumStockDto,
    ): Promise<void> {
        await this.globalMinimumStock.execute({
            itemId: id,
            tenantId: dto.tenantId,
            minStock: dto.minStock,
        });
    };



    /**
     * Minimo POR SUCURSAL, en lote. Parcial: solo toca las sucursales enviadas.
     * Una entrada con minStock null elimina el override de esa sede.
     */
    @Patch('minimum/branches/:id')
    public async setBranchMinimumStock(
        @Param('id') id: string,
        @Body() dto: SetBranchMinimumStockDto,
    ): Promise<void> {
        await this.branchMinimumStock.execute({
            itemId: id,
            tenantId: dto.tenantId,
            branches: dto.branches,
        });
    };
};