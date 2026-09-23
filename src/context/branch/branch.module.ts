import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BranchEntity } from "./infrastructure/persistence/models/branch.entity";
import { BranchController } from "./infrastructure/http/branch.controller";
import { BranchRepository } from "./domain";
import { TypeOrmBranchRepository } from "./infrastructure/persistence/repositories/branch.repository";
import { CreateBranchUseCase, DeleteBranchUseCase, SearchBranchesUseCase, UpdateBranchUseCase } from "./application";
import { TenantModule } from "../tenants/tenant.module";
import { TenantChecker } from "./application/ports/tenant-checker";
import { TenantCheckerAdapter } from "./infrastructure/persistence/adapters/tenant-checker.adapter";



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
            useClass: TypeOrmBranchRepository,
        },

        {
            provide: TenantChecker,
            useClass: TenantCheckerAdapter,
        },

        {
            provide: CreateBranchUseCase,
            useFactory: (
                repository: BranchRepository,
                tenantChecker: TenantChecker,
            ) =>
                new CreateBranchUseCase(
                    repository,
                    tenantChecker,
                ),
            inject: [
                BranchRepository,
                TenantChecker,
            ],
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
            provide: SearchBranchesUseCase,
            useFactory: (repository: BranchRepository) =>
                new SearchBranchesUseCase(repository),
            inject: [BranchRepository],
        },
    ],

    exports: [
        BranchRepository,
    ],
})
export class BranchModule {}