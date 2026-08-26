import { DomainEvent } from "@/shared";
import { UserSexEnum } from "../types";
import { UserCreatedProps } from "../types/user-event";

export class UserCreatedEvent extends DomainEvent {
  public readonly eventName = "user.created";

  public readonly userId: string;
  public readonly tenantId: string;
  public readonly branchId: string | null;
  public readonly rolId: string;
  public readonly rolScope: string;
  public readonly userName: string;
  public readonly email: string | null;
  public readonly firstName: string;
  public readonly secondName: string | null;
  public readonly firstLastName: string;
  public readonly secondLastName: string | null;
  public readonly age: Date;
  public readonly sex: UserSexEnum;
  public readonly phone: string;
  public readonly isActive: boolean;

  constructor(props: UserCreatedProps) {
    super();

    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.branchId = props.branchId;
    this.rolId = props.rolId;
    this.rolScope = props.rolScope;
    this.userName = props.userName;
    this.email = props.email;
    this.firstName = props.firstName;
    this.secondName = props.secondName;
    this.firstLastName = props.firstLastName;
    this.secondLastName = props.secondLastName;
    this.age = props.age;
    this.sex = props.sex;
    this.phone = props.phone;
    this.isActive = props.isActive;
  }
}