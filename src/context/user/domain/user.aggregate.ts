import { AggregateRoot } from "@/shared";
import {
  UserBirthDate,
  UserBranchId,
  UserEmail,
  UserId,
  UserName,
  UserHashedPassword,
  UserPhone,
  UserRolId,
  UserSex,
  UserTenantId,
  UserRolScope,
} from "./value-object";
import { UserCreatedEvent } from "./events/user-created.event";
import { UserPrimitives } from "./types/user-primitives";
import {
  AdministrativeUserCannotBelongToBranchException,
  OperationalUserRequiresBranchException,
  UserAlreadyActiveException,
  UserAlreadyInactiveException,
} from "./exceptions/user-exceptions";

export class UserAggregate extends AggregateRoot<UserId> {
  private tenantId: UserTenantId;
  private branchId: UserBranchId | null;
  private rolId: UserRolId;
  private rolName: string;
  private rolScope: UserRolScope;
  private userName: UserName;
  private email: UserEmail | null;
  private password: UserHashedPassword;
  private firstName: string;
  private secondName: string | null;
  private firstLastName: string;
  private secondLastName: string | null;
  private age: UserBirthDate;
  private sex: UserSex;
  private phone: UserPhone;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: UserId,
    tenantId: UserTenantId,
    branchId: UserBranchId | null,
    rolId: UserRolId,
    rolName: string,
    rolScope: UserRolScope,
    userName: UserName,
    email: UserEmail | null,
    password: UserHashedPassword,
    firstName: string,
    secondName: string | null,
    firstLastName: string,
    secondLastName: string | null,
    age: UserBirthDate,
    sex: UserSex,
    phone: UserPhone,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id);

    this.tenantId = tenantId;
    this.branchId = branchId;
    this.rolId = rolId;
    this.rolName = rolName;
    this.rolScope = rolScope;
    this.userName = userName;
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.secondName = secondName;
    this.firstLastName = firstLastName;
    this.secondLastName = secondLastName;
    this.age = age;
    this.sex = sex;
    this.phone = phone;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  public static create(params: {
    tenantId: UserTenantId;
    branchId?: UserBranchId | null;
    rolId: UserRolId;
    rolName: string;
    rolScope: UserRolScope;
    userName: UserName;
    email: UserEmail | null;
    password: UserHashedPassword;
    firstName: string;
    secondName?: string | null;
    firstLastName: string;
    secondLastName?: string | null;
    age: UserBirthDate;
    sex: UserSex;
    phone: UserPhone;
  }): UserAggregate {
    const now = new Date();
    const branchId = params.branchId ?? null;

    UserAggregate.ensureBranchMatchesRolScope(params.rolScope, branchId);
    const user = new UserAggregate(
      UserId.generate(),
      params.tenantId,
      branchId,
      params.rolId,
      params.rolName,
      params.rolScope,
      params.userName,
      params.email,
      params.password,
      params.firstName,
      params.secondName ?? null,
      params.firstLastName,
      params.secondLastName ?? null,
      params.age,
      params.sex,
      params.phone,
      true,
      now,
      now,
    );

    user.registerEvent(
      new UserCreatedEvent({
        userId: user.id.value,
        tenantId: user.tenantId.value,
        branchId: user.branchId?.value ?? null,
        rolId: user.rolId.value,
        rolScope: user.rolScope.value,
        userName: user.userName.value,
        email: user.email?.value ?? null,
        firstName: user.firstName,
        secondName: user.secondName,
        firstLastName: user.firstLastName,
        secondLastName: user.secondLastName,
        age: user.age.value,
        sex: user.sex.value,
        phone: user.phone.value,
        isActive: user.isActive,
      }),
    );
    return user;
  }

  private static ensureBranchMatchesRolScope(
    scope: UserRolScope,
    branchId: UserBranchId | null,
  ): void {
    if (scope.isAdministrative() && branchId !== null) {
      throw new AdministrativeUserCannotBelongToBranchException();
    }

    if (scope.isOperational() && branchId === null) {
      throw new OperationalUserRequiresBranchException();
    }
  }

  public toPrimitives(): UserPrimitives {
    return {
      id: this.id.value,
      tenantId: this.tenantId.value,
      branchId: this.branchId?.value ?? null,
      rolId: this.rolId.value,
      rolName: this.rolName,
      rolScope: this.rolScope.value,
      userName: this.userName.value,
      email: this.email?.value ?? null,
      password: this.password.value,
      firstName: this.firstName,
      secondName: this.secondName,
      firstLastName: this.firstLastName,
      secondLastName: this.secondLastName,
      age: this.age.value,
      sex: this.sex.value,
      phone: this.phone.value,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPrimitives(primitives: UserPrimitives): UserAggregate {
    return new UserAggregate(
      UserId.create(primitives.id),
      UserTenantId.create(primitives.tenantId),
      primitives.branchId ? UserBranchId.create(primitives.branchId) : null,
      UserRolId.create(primitives.rolId),
      primitives.rolName,
      UserRolScope.create(primitives.rolScope),
      UserName.create(primitives.userName),
      primitives.email ? UserEmail.create(primitives.email) : null,
      UserHashedPassword.fromHash(primitives.password),
      primitives.firstName,
      primitives.secondName,
      primitives.firstLastName,
      primitives.secondLastName,
      UserBirthDate.create(primitives.age),
      UserSex.create(primitives.sex),
      UserPhone.create(primitives.phone),
      primitives.isActive,
      primitives.createdAt,
      primitives.updatedAt,
    );
  }

  private ensureActive(): void {
    if (!this.isActive) {
      throw new UserAlreadyInactiveException();
    }
  }

  public changeCredentials(email: UserEmail | null, userName: UserName): void {
    this.ensureActive();

    this.email = email;
    this.userName = userName;

    this.touch();
  }

  public changePassword(password: UserHashedPassword): void {
    this.ensureActive();

    this.password = password;

    this.touch();
  }

  public updateProfile(
    firstName: string,
    secondName: string | null,
    firstLastName: string,
    secondLastName: string | null,
    age: UserBirthDate,
    sex: UserSex,
    phone: UserPhone,
  ): void {
    this.ensureActive();

    this.firstName = firstName;
    this.secondName = secondName;
    this.firstLastName = firstLastName;
    this.secondLastName = secondLastName;
    this.age = age;
    this.sex = sex;
    this.phone = phone;

    this.touch();
  }

  public reassign(
    scope: UserRolScope,
    rolId: UserRolId,
    rolName: string,
    branchId: UserBranchId | null,
  ): void {
    this.ensureActive();

    UserAggregate.ensureBranchMatchesRolScope(scope, branchId);

    this.rolId = rolId;
    this.rolName = rolName;
    this.rolScope = scope;
    this.branchId = branchId;

    this.touch();
  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new UserAlreadyInactiveException();
    }

    this.isActive = false;
    this.touch();
  }

  public activate(): void {
    if (this.isActive) {
      throw new UserAlreadyActiveException();
    }

    this.isActive = true;
    this.touch();
  }
}
