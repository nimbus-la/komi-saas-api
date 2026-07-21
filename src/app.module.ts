import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppConfigModule, DatabaseModule } from './infrastructure';
import { TenantModule } from './context/tenants/tenant.module';
import { ProductsModule } from './context/products/products.module';
import { InventoryModule } from './context/inventory/inventory-item.module';
import { RecipeItemModule } from './context/recipes/items/recipe-item.module';
import { InventoryMovementModule } from './context/inventory-movements';
import { RolModule } from './context/rol/infrastructure/rol.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AppConfigModule,
    DatabaseModule,
    InventoryModule,
    InventoryMovementModule,
    TenantModule,
    ProductsModule,
    RecipeItemModule,
    RolModule,
  ],
})

export class AppModule { };