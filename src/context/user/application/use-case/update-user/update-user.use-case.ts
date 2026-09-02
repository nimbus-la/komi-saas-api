import {
  UserBirthDate,
  UserEmail,
  UserEmailAlreadyExistsException,
  UserHashedPassword,
  UserId,
  UserName,
  UserNameAlreadyExistsException,
  UserNotFoundException,
  UserPhone,
  UserPlainPassword,
  UserRepository,
  UserSex,
  UserTenantId,
} from "@/context/user/domain";

import { PasswordHasher } from "../../ports/password-hasher";

/**
 * Lo que el caso de uso acepta de verdad.
 *
 * No coincide con UpdateUserDto y el controlador pasa el body sin mapear: lo
 * que sobra en la DTO se descarta aquí, y lo que falta lo corta el
 * ValidationPipe con 400. Detalle en user.controller.
 */
export interface UpdateUserParams {
  userName?: string;
  email?: string | null;
  password?: string;
  firstName?: string;
  secondName?: string | null;
  firstLastName?: string;
  secondLastName?: string | null;
  age?: Date;
  sex?: string;
  phone?: string;
}

/**
 * Cambia los datos propios del usuario: credenciales, contraseña y perfil.
 *
 * No toca estado ni asignación a propósito: eso es ToggleUserStatusUseCase y
 * ReassignUserUseCase. La contraseña debería salir por el mismo criterio (ver
 * la nota sobre params.password más abajo). Como todos los métodos del
 * agregado que se usan aquí llaman a ensureActive(), un usuario inactivo no
 * se puede editar.
 */
export class UpdateUserUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async execute(
    tenantId: string,
    id: string,
    params: UpdateUserParams,
  ): Promise<void> {
    const tenant = UserTenantId.create(tenantId);
    const userId = UserId.create(id);

    const user = await this.repository.searchAggregateById(tenant, userId);

    if (user === null) {
      throw new UserNotFoundException(id);
    }

    const current = user.toPrimitives();

    if (params.userName !== undefined || params.email !== undefined) {
      const userName = UserName.create(params.userName ?? current.userName);

      const email =
        params.email === null
          ? null
          : params.email !== undefined
            ? UserEmail.create(params.email)
            : current.email
              ? UserEmail.create(current.email)
              : null;

      if (
        params.userName !== undefined &&
        params.userName !== current.userName
      ) {
        const exists = await this.repository.existsByUserName(
          tenant,
          userName,
          userId,
        );

        if (exists) {
          throw new UserNameAlreadyExistsException(params.userName);
        }
      }

      if (
        email !== null &&
        params.email !== undefined &&
        params.email !== current.email
      ) {
        const exists = await this.repository.existsByEmail(
          tenant,
          email,
          userId,
        );

        if (exists) {
          throw new UserEmailAlreadyExistsException(email.value);
        }
      }

      user.changeCredentials(email, userName);
    }

    // Esto no pertenece a este caso de uso. Hoy no se pide la contraseña actual
    // ni se distingue cambiar la propia de cambiar la de otro: solo corren
    // JwtAuthGuard y TenantScopeGuard, ninguna comprobación de rol, así que
    // cualquier sesión del negocio puede reescribir la de un compañero. Esas
    // reglas no tienen nada que ver con actualizar un perfil, y aquí no hay
    // dónde ponerlas sin que apliquen también al resto de los campos.
    //
    // TODO: mover a ChangeUserPasswordUseCase (PATCH /user/password) y quitar
    // PasswordHasher de este constructor, que es la única razón por la que
    // está inyectado.
    if (params.password !== undefined) {
      const plainPassword = UserPlainPassword.create(params.password);

      const hash = await this.passwordHasher.hash(plainPassword);

      const hashedPassword = UserHashedPassword.fromHash(hash);

      user.changePassword(hashedPassword);
    }

    // Los nombres nunca llegan (la DTO los llama fullName/lastName), así que
    // solo se entra aquí mandando age, sex o phone. En ese caso los nombres se
    // reescriben con los que el usuario ya tenía.
    if (
      params.firstName !== undefined ||
      params.secondName !== undefined ||
      params.firstLastName !== undefined ||
      params.secondLastName !== undefined ||
      params.age !== undefined ||
      params.sex !== undefined ||
      params.phone !== undefined
    ) {
      const firstName = params.firstName ?? current.firstName;

      const secondName =
        params.secondName !== undefined
          ? params.secondName
          : current.secondName;

      const firstLastName = params.firstLastName ?? current.firstLastName;

      const secondLastName =
        params.secondLastName !== undefined
          ? params.secondLastName
          : current.secondLastName;

      const birthDate = UserBirthDate.create(params.age ?? current.age);

      const sex = UserSex.create(params.sex ?? current.sex);

      const phone = UserPhone.create(params.phone ?? current.phone);

      user.updateProfile(
        firstName,
        secondName,
        firstLastName,
        secondLastName,
        birthDate,
        sex,
        phone,
      );
    }

    // Se escribe siempre, haya cambiado algo o no: un body con solo userId no
    // entra en ninguna rama y aun así hace el UPDATE, pisando updatedAt.
    //
    // Nadie puede detectarlo porque la actualización está partida en tres
    // métodos (changeCredentials, changePassword, updateProfile) y ninguno ve
    // el conjunto. El patrón que ya usa inventario: un solo update() en el
    // agregado que recibe únicamente lo que cambia y lanza si no llega nada
    // (InventoryItemAggregate.update -> EmptyUpdateException, código 1352).
    // TODO: llevarlo a UserAggregate con su propia excepción; en el catálogo
    // el 1030 está libre dentro del bloque de validación de usuario.
    await this.repository.update(tenant, user);
  }
}
