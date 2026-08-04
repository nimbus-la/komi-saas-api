import { AggregateRoot } from "@/shared";
import {
  UserBirthDate,
  UserBranchId,
  UserEmail,
  UserFullName,
  UserId,
  UserLastName,
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
  private rolScope: UserRolScope;
  private userName: UserName;
  private email: UserEmail;
  private password: UserHashedPassword;
  private fullName: UserFullName;
  private lastName: UserLastName;
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
    rolScope: UserRolScope,
    userName: UserName,
    email: UserEmail,
    password: UserHashedPassword,
    fullName: UserFullName,
    lastName: UserLastName,
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
    this.rolScope = rolScope;
    this.userName = userName;
    this.email = email;
    this.password = password;
    this.fullName = fullName;
    this.lastName = lastName;
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
    rolScope: UserRolScope;
    userName: UserName;
    email: UserEmail;
    password: UserHashedPassword;
    fullName: UserFullName;
    lastName: UserLastName;
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
      params.rolScope,
      params.userName,
      params.email,
      params.password,
      params.fullName,
      params.lastName,
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
        email: user.email.value,
        fullName: user.fullName.value,
        lastName: user.lastName.value,
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
      rolScope: this.rolScope.value,
      userName: this.userName.value,
      email: this.email.value,
      password: this.password.value,
      fullName: this.fullName.value,
      lastName: this.lastName.value,
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
      UserRolScope.create(primitives.rolScope),
      UserName.create(primitives.userName),
      UserEmail.create(primitives.email),
      UserHashedPassword.fromHash(primitives.password),
      UserFullName.create(primitives.fullName),
      UserLastName.create(primitives.lastName),
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

  public changeCredentials(email: UserEmail, userName: UserName): void {
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
    fullName: UserFullName,
    lastName: UserLastName,
    age: UserBirthDate,
    sex: UserSex,
    phone: UserPhone,
  ): void {
    this.ensureActive();

    this.fullName = fullName;
    this.lastName = lastName;
    this.age = age;
    this.sex = sex;
    this.phone = phone;

    this.touch();
  }

  public reassign(
    scope: UserRolScope,
    rolId: UserRolId,
    branchId: UserBranchId | null,
  ): void {
    this.ensureActive();

    UserAggregate.ensureBranchMatchesRolScope(scope, branchId);

    this.rolId = rolId;
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
