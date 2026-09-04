import { Body, Controller, Get, Patch, Post, Query } from "@nestjs/common";

import { ResponseMessage } from "@/infrastructure";
import { type AuthenticatedUser, CurrentUser } from "@/auth/infrastructure";

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
import { FindInventoryItemDto } from "./dtos/find-item.dto";
import { SearchItemBatchesDto } from "./dtos/search-item-batches.dto";


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
    @ResponseMessage("Item de inventario creado exitosamente.")
    public async create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateItemDto
    ): Promise<void> {
        await this.createItem.execute({ ...dto, tenantId: user.tenantId });
    };



    // TODO: Implementar criterios de busqueda y filtrado de items
    @Get()
    public async list(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: SearchInventoryItemsDto
    ) {
        const { branchId, pageNumber, pageSize } = query;

        return this.searchItems.execute(user.tenantId, { pageNumber, pageSize }, branchId);
    };



    @Get('find')
    public async find(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: FindInventoryItemDto
    ) {
        return this.findItem.execute(query.itemId, user.tenantId, query.branchId);
    };



    @Post('receive')
    public async receive(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: ReceiveStockDto
    ): Promise<void> {
        await this.receiveStock.execute({
            itemId: dto.itemId,
            tenantId: user.tenantId,
            branchId: dto.branchId,
            quantityReceived: dto.quantityReceived,
            totalCostAmount: dto.totalCostAmount,
            expirationDate: dto.expirationDate ?? null,
            ...(dto.receivedAt ? { receivedAt: dto.receivedAt } : {}),
        });
    };



    @Post('consume')
    public async consume(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: ConsumeStockDto
    ): Promise<void> {
        await this.consumeStock.execute({
            itemId: dto.itemId,
            tenantId: user.tenantId,
            branchId: dto.branchId,
            quantity: dto.quantity,
            ...(dto.consumedAt ? { consumedAt: dto.consumedAt } : {}),
        });
    };



    /** Merma por cantidad total: FEFO reparte entre lotes. */
    @Post('waste')
    public async waste(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: RegisterWasteDto
    ): Promise<void> {
        await this.registerWaste.execute({
            itemId: dto.itemId,
            tenantId: user.tenantId,
            branchId: dto.branchId,
            quantity: dto.quantity,
            reason: dto.reason,
            ...(dto.occurredAt ? { occurredAt: dto.occurredAt } : {}),
        });
    };



    /** Conteo físico: cuadra el total del item en una sucursal (solo hacia abajo). */
    @Post('count')
    public async count(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CountStockDto
    ): Promise<void> {
        await this.countStock.execute({
            itemId: dto.itemId,
            tenantId: user.tenantId,
            branchId: dto.branchId,
            actualTotal: dto.actualTotal,
            reason: dto.reason,
            ...(dto.occurredAt ? { occurredAt: dto.occurredAt } : {}),
        });
    };



    @Get('batches')
    public async batches(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: SearchItemBatchesDto
    ) {
        const { itemId, branchId, pageNumber, pageSize } = query;

        return this.searchItemBatches.execute(itemId, user.tenantId, { pageNumber, pageSize }, branchId);
    };



    @Patch('update')
    public async update(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateItemDto,
    ): Promise<void> {
        const { itemId, ...changes } = dto;

        await this.updateItem.execute(itemId, user.tenantId, changes);
    };



    /**
     * Minimo GLOBAL del item: aplica a toda sucursal sin override propio.
     * No toca los overrides existentes. minStock null lo limpia.
     */
    @Patch('minimum/global')
    public async setGlobalMinimumStock(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: SetGlobalMinimumStockDto,
    ): Promise<void> {
        await this.globalMinimumStock.execute({
            itemId: dto.itemId,
            tenantId: user.tenantId,
            minStock: dto.minStock,
        });
    };



    /**
     * Minimo POR SUCURSAL, en lote. Parcial: solo toca las sucursales enviadas.
     * Una entrada con minStock null elimina el override de esa sede.
     */
    @Patch('minimum/branches')
    public async setBranchMinimumStock(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: SetBranchMinimumStockDto,
    ): Promise<void> {
        await this.branchMinimumStock.execute({
            itemId: dto.itemId,
            tenantId: user.tenantId,
            branches: dto.branches,
        });
    };
};