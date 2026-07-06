import { Module } from '@nestjs/common';

import { AppConfigModule, DatabaseModule } from './shared/infrastructure';
import { ProductsModule } from './context/products/products.module';
import { InventoryModule } from './context/inventory/inventory-item.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    InventoryModule,
    ProductsModule,
  ],
})
export class AppModule { }