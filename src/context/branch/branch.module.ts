import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BranchEntity } from "./infrastructure/persistence/models/branch.entity";
import { BranchController } from "./infrastructure/http/branch.controller";
import { BranchRepository } from "./domain";
import { BranchService } from "./infrastructure/persistence/repositories/branch.repository";
import { CreateBranchUseCase, DeleteBranchUseCase, SearchAllBranchUseCase, SearchBranchesByTenantUseCase, SearchBranchUseCase, UpdateBranchUseCase } from "./application";
import { TenantModule } from "../tenants/tenant.module";
import { TenantRepository } from "../tenants/domain";



@Module({
    imports: [
        TypeOrmModule.forFeature([BranchEntity]),
        TenantModule
    ],

    controllers: [
        BranchController,
    ],

    providers: [
        {
            provide: BranchRepository,
            useClass: BranchService,
        },

        {
            provide: CreateBranchUseCase,
            useFactory: (
                repository: BranchRepository,
                tenantRepository: TenantRepository,
            ) =>
                new CreateBranchUseCase(
                    repository,
                    tenantRepository,
                ),
            inject: [
                BranchRepository,
                TenantRepository,
            ],
        },

        {
            provide: SearchBranchUseCase,
            useFactory: (repository: BranchRepository) =>
                new SearchBranchUseCase(repository),
            inject: [BranchRepository],
        },

        {
            provide: SearchAllBranchUseCase,
            useFactory: (repository: BranchRepository) =>
                new SearchAllBranchUseCase(repository),
            inject: [BranchRepository],
        },

        {
            provide: UpdateBranchUseCase,
            useFactory: (repository: BranchRepository) =>
                new UpdateBranchUseCase(repository),
            inject: [BranchRepository],
        },

        {
            provide: DeleteBranchUseCase,
            useFactory: (repository: BranchRepository) =>
                new DeleteBranchUseCase(repository),
            inject: [BranchRepository],
        },

        {
            provide: SearchBranchesByTenantUseCase,
            useFactory: (repository: BranchRepository) =>
                new SearchBranchesByTenantUseCase(repository),
            inject: [BranchRepository],
        },
    ],

    exports: [
        BranchRepository,
    ],
})
export class BranchModule {};