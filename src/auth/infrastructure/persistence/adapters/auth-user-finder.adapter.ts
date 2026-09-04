import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

import { UserAggregate, UserId, UserName, UserRepository, UserTenantId } from "@/context/user/domain";
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
        private readonly usersRepository: UserRepository,
        private readonly logger: PinoLogger
    ) {
        this.logger.setContext(AuthUserFinderAdapter.name);
    }


    public async findByUserId(tenantId: string, userId: string): Promise<AuthUserCredentials | null> {
        let user: UserId;

        try {
            user = UserId.create(userId);
        } catch (error: unknown) {
            // Que no exista y que llegue con un formato imposible se
            // responden igual hacia arriba, y así debe seguir. Pero son cosas
            // distintas, porque lo segundo es un identificador mal construido y
            // sin esta línea se investigaba como si el usuario se hubiera
            // borrado.
            this.logger.debug({ userId, err: error }, 'El identificador de usuario no es válido: se responde como inexistente');

            return null;
        }

        const findUserId = await this.usersRepository.searchAggregateById(
            UserTenantId.create(tenantId),
            user
        );

        return findUserId ?
            this.toUserCredentials(findUserId)
            : null
    }


    public async findByUserName(tenantId: string, userName: string): Promise<AuthUserCredentials | null> {
        let name: UserName;

        try {
            name = UserName.create(userName);
        } catch (error: unknown) {
            // Un username con caracteres especiales no permitidos hace fallar el value object.
            // Aquí eso significa "no existe".
            this.logger.debug({ userName, err: error }, 'El nombre de usuario no es válido: se responde como inexistente');

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
