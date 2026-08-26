import { Injectable } from "@nestjs/common";

import { UserAggregate, UserName, UserRepository, UserTenantId } from "@/context/user/domain";
import { AuthUserCredentials, AuthUserFinder } from "../../../application";


@Injectable()
export class AuthUserFinderAdapter implements AuthUserFinder {
    constructor(
        private readonly usersRepository: UserRepository
    ) { }


    public async findByUserName(tenantId: string, userName: string): Promise<AuthUserCredentials | null> {
        let name: UserName;

        try {
            name = UserName.create(userName);
        } catch {
            // Un username con caracteres especiales no permitidos hace fallar el value object.
            // Aquí eso significa "no existe".
            return null;
        }

        // Ojo con el try de arriba: cubre solo el value object. Si se cae la consulta o
        // el armado del agregado (un hash inválido en la BD, por ejemplo) queremos que el
        // error salga a la luz, no que parezca un usuario que no existe.
        const findUser = await this.usersRepository.searchAggregateByUserName(
            UserTenantId.create(tenantId),
            name
        );

        return findUser ?
            this.toUserCredentials(findUser)
            : null;
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
            firstName: primitives.firstName,
            secondName: primitives.secondName,
            firstLastName: primitives.firstLastName,
            secondLastName: primitives.secondLastName,
            sex: primitives.sex,
            passwordHash: primitives.password,
            isActive: primitives.isActive,
        }
    }
}