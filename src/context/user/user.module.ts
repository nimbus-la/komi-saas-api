import { TypeOrmModule } from "@nestjs/typeorm";
import { BranchModule } from "../branch/branch.module";
import { RolModule } from "../rol/rol.module";
import { CreateUserUseCase, SearchAllUsersUseCase, SearchUserUseCase, UpdateUserUseCase } from "./application";
import { UserRepository } from "./domain";
import { UserController, UserEntity, UserService } from "./infrastructure";
import { Module } from "@nestjs/common";
import { BranchRepository } from "../branch/domain";
import { RolRepository } from "../rol/domain/rol.respository";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        BranchModule,
        RolModule,
    ],
    controllers: [
        UserController,
    ],
    providers: [
        {
            provide: UserRepository,
            useClass: UserService,
        },
        {
            provide: CreateUserUseCase,
            useFactory: (
                repository: UserRepository,
                branchRepository: BranchRepository,
                rolRepository: RolRepository,
            ) =>
                new CreateUserUseCase(
                    repository,
                    branchRepository,
                    rolRepository,
                ),
            inject: [
                UserRepository,
                BranchRepository,
                RolRepository,
            ],
        },
        {
            provide: UpdateUserUseCase,
            useFactory: (
                repository: UserRepository
            ) =>
                new UpdateUserUseCase(
                    repository
                ),
            inject: [
                UserRepository,
                BranchRepository,
                RolRepository,
            ],
        },
        {
            provide: SearchUserUseCase,
            useFactory: (
                repository: UserRepository,
            ) => new SearchUserUseCase(repository),
            inject: [UserRepository],
        },
        {
            provide: SearchAllUsersUseCase,
            useFactory: (
                repository: UserRepository,
            ) => new SearchAllUsersUseCase(repository),
            inject: [UserRepository],
        },
    ],
    exports: [
        UserRepository,
    ],
})
export class UserModule {}