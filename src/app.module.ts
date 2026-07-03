import { Module } from '@nestjs/common';

import { AppConfigModule, DatabaseModule } from './shared/infrastructure';
import { InventoryModule } from './context/inventory/inventory.module';
import { ProductsModule } from './context/products/products.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    InventoryModule,
    ProductsModule,
  ],
})
export class AppModule { }