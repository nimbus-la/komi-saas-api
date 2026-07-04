import { Module } from '@nestjs/common';

import { AppConfigModule, DatabaseModule } from './shared/infrastructure';
import { InventoryModule } from './context/inventory/inventory.module';
import { TenantModule } from './context/tenants/tenant.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    InventoryModule,
    TenantModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
