import { Module } from "@nestjs/common";
import { TenantController, TenantEntity } from "./infrastructure";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreateTenantUseCase, DeleteTenantUseCases, SearchAllTenantsUseCase, SearchTenantUseCase, UpdateTenantUseCase } from "./application";
import { TenantRepository } from "./domain";
import { TenantService } from "./infrastructure/persistence/repositories/tenant.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([TenantEntity]),
    ],
    controllers: [
        TenantController,
    ],
    providers: [
        {
            provide: TenantRepository,
            useClass: TenantService,
        },
        {
            provide: CreateTenantUseCase,
            useFactory: (repository: TenantRepository) =>
                new CreateTenantUseCase(repository),
            inject: [TenantRepository],
        },
        {
            provide: SearchTenantUseCase,
            useFactory: (repository: TenantRepository) =>
                new SearchTenantUseCase(repository),
            inject: [TenantRepository]
        },
        {
            provide: SearchAllTenantsUseCase,
            useFactory: (repository: TenantRepository) =>
                new SearchAllTenantsUseCase(repository),
            inject: [TenantRepository],
        },
        {
            provide: UpdateTenantUseCase,
            useFactory: (repository: TenantRepository) =>
                new UpdateTenantUseCase(repository),
            inject: [TenantRepository]
        },
        {
            provide: DeleteTenantUseCases,
            useFactory: (repository: TenantRepository) =>
                new DeleteTenantUseCases(repository),
            inject: [TenantRepository]
        },
    ],
    exports: [
        TenantRepository,
    ],
})
export class TenantModule { };