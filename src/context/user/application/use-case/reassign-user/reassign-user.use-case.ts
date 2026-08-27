import {
  UserBranchId,
  UserBranchNotFoundException,
  UserId,
  UserNotFoundException,
  UserRepository,
  UserRolId,
  UserRolNotFoundException,
} from "@/context/user/domain";
import { BranchChecker } from "../../ports/branch-checker";
import { RolFinder } from "../../ports/rol-finder";

export interface ReassignUserParams {
  rolId: string;
  branchId?: string | null;
}

export class ReassignUserUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly rolFinder: RolFinder,
    private readonly branchChecker: BranchChecker,
  ) {}

  public async execute(id: string, params: ReassignUserParams): Promise<void> {
    const user = await this.repository.searchAggregateById(UserId.create(id));

    if (user === null) {
      throw new UserNotFoundException(id);
    }

    const rol = await this.rolFinder.findById(params.rolId);

    if (rol === null) {
      throw new UserRolNotFoundException(params.rolId);
    }

    let branchId: UserBranchId | null = null;

    if (params.branchId !== undefined && params.branchId !== null) {
      const branchExists = await this.branchChecker.existsInTenant(
        params.branchId,
        user.toPrimitives().tenantId,
      );

      if (!branchExists) {
        throw new UserBranchNotFoundException(params.branchId);
      }

      branchId = UserBranchId.create(params.branchId);
    }

    user.reassign(rol.scope, UserRolId.create(params.rolId), rol.name, branchId);

    await this.repository.update(user);
  }
}
