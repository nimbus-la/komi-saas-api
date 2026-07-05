import { Module } from '@nestjs/common';

import { AppConfigModule, DatabaseModule } from './shared/infrastructure';
import { InventoryModule } from './context/inventory/inventory-item.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    InventoryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
