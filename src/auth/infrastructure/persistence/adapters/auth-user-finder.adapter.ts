import { Injectable } from "@nestjs/common";

import { UserAggregate, UserName, UserRepository, UserTenantId } from "@/context/user/domain";
import { AuthUserCredentials, AuthUserFinder } from "../../../application";


/**
 * Conecta el login con el módulo de usuarios.
 *
 * Su trabajo es traducir en las dos direcciones: convierte los textos crudos que
 * maneja el login en los value objects que exige el dominio de usuarios, y
 * devuelve el agregado aplanado en la vista mínima que el login necesita. Gracias
 * a esto la capa de aplicación de auth no conoce el agregado de usuario.
 */
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


    /**
     * Aplana el agregado a la vista que usa el login. Se copian solo los campos
     * que hacen falta para autenticar; todo lo demás del usuario se queda en su
     * propio módulo.
     */
    private toUserCredentials(user: UserAggregate): AuthUserCredentials {
        const primitives = user.toPrimitives();

        return {
            userId: primitives.id,
            tenantId: primitives.tenantId,
            branchId: primitives.branchId,
            rolName: primitives.rolName,
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
