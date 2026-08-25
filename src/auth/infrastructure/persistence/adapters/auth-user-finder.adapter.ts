import { Injectable } from "@nestjs/common";

import { UserAggregate, UserName, UserRepository, UserTenantId } from "@/context/user/domain";
import { AuthUserCredentials, AuthUserFinder } from "../../../application";


@Injectable()
export class AuthUserFinderAdapter implements AuthUserFinder {
    constructor(
        private readonly usersRepository: UserRepository
    ) { }


    public async findByUserName(tenantId: string, userName: string): Promise<AuthUserCredentials | null> {
        try {
            const findUser = await this.usersRepository.searchAggregateByUserName(
                UserTenantId.create(tenantId),
                UserName.create(userName)
            );

            return findUser ?
                this.toUserCredentials(findUser)
                : null;
        } catch {
            // Un username con caracteres especiales no permitidos hace fallar el value object.
            // Aquí eso significa "no existe".
            return null;
        }
    }


    private toUserCredentials(user: UserAggregate): AuthUserCredentials {
        const primitives = user.toPrimitives();

        return {
            userId: primitives.id,
            tenantId: primitives.tenantId,
            branchId: primitives.branchId,
            rolId: primitives.rolId,
            rolScope: primitives.rolScope,
            userName: primitives.userName,
            fullName: primitives.fullName,
            lastName: primitives.lastName,
            sex: primitives.sex,
            passwordHash: primitives.password,
            isActive: primitives.isActive,
        }
    }
}