import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query, UseFilters, UseInterceptors } from "@nestjs/common";

import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";
import { ConsumeStockUseCase, CreateInventoryItemUseCase, FindInventoryItemUseCase, ReceiveStockUseCase, SearchInventoryItemsUseCase, SearchItemBatchesUseCase, SetMinimumStockUseCase, UpdateInventoryItemUseCase } from "../../application";
import { CreateItemDto } from "./dtos/create-item.dto";
import { ReceiveStockDto } from "./dtos/receive-stock.dto";
import { ConsumeStockDto } from "./dtos/consume-stock.dto";
import { UpdateItemDto } from "./dtos/update-item.dto";
import { SetMinimumStockDto } from "./dtos/set-minimum-stock.dto";


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