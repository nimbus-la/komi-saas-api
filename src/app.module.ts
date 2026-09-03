import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppConfigModule, DatabaseModule, LoggingModule } from './infrastructure';
import { TenantModule } from './context/tenants/tenant.module';
import { ProductsModule } from './context/products/products.module';
import { CategoriesModule } from './context/product-categories/categories.module';
import { InventoryModule } from './context/inventory/inventory-item.module';
import { InventoryMovementModule } from './context/inventory-movements';
import { MenusModule } from './context/menus/menus.module';
import { RolModule } from './context/rol/rol.module';
import { UserModule } from './context/user/user.module';
import { AuthModule } from './auth';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AppConfigModule,
    LoggingModule,
    DatabaseModule,
    AuthModule,
    InventoryModule,
    InventoryMovementModule,
    TenantModule,
    ProductsModule,
    CategoriesModule,
    RolModule,
    MenusModule,
    UserModule,
  ],
})

export class AppModule { };