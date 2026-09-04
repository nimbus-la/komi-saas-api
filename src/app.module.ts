import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AllExceptionsFilter, AppConfigModule, DatabaseModule, LoggingModule, ResponseInterceptor } from './infrastructure';
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

  /**
   * El filtro y el interceptor son globales, no de cada controlador.
   *
   * Colgados uno a uno solo cubrían sus rutas, así que una ruta que no existe,
   * un error en un middleware o un controlador nuevo al que se le olvidara el
   * decorador respondían con el error crudo de Nest, sin código de catálogo ni
   * `traceId`. Aquí no hay nada que acordarse de poner.
   */
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})

export class AppModule { };