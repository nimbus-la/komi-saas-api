import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Patch, Post, Query, UseFilters, UseInterceptors } from "@nestjs/common";

import { AllExceptionsFilter, ResponseInterceptor } from "@/shared";
import { CreateInventoryItemUseCase } from "../../application/create-item/create-inventory-item.use-case";
import { SearchInventoryItemsUseCase } from "../../application/search-items/search-inventory-items.use-case";
import { FindInventoryItemUseCase } from "../../application/find-item/find-inventory-item.use-case";
import { ReceiveStockUseCase } from "../../application/receive-stock/receive-stock.use-case";
import { ConsumeStockUseCase } from "../../application/consume-stock/consume-stock.use-case";
import { SearchItemBatchesUseCase } from "../../application/search-item-batches/search-item-batches.use-case";
import { CreateItemDto } from "./dtos/create-item.dto";
import { ReceiveStockDto } from "./dtos/receive-stock.dto";
import { ConsumeStockDto } from "./dtos/consume-stock.dto";
import { UpdateInventoryItemUseCase } from "../../application/update-item/update-inventory-item.use-case";
import { UpdateItemDto } from "./dtos/update-item.dto";


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
        @Query('branchId') branchId?: string,
    ) {
        return this.findItem.execute(id, branchId);
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
    ) {
        return this.searchItemBatches.execute(id, { pageNumber, pageSize });
    };



    @Patch(':id')
    public async update(
        @Param('id') id: string,
        @Body() dto: UpdateItemDto,
    ): Promise<void> {
        await this.updateItem.execute(id, dto);
    };
};