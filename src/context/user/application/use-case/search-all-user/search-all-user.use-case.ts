import { UserRepository, UserResponse } from "@/context/user/domain";

export class SearchAllUsersUseCase {

    constructor(
        private readonly repository: UserRepository,
    ) {}

    public async execute(): Promise<UserResponse[]> {
        return this.repository.searchAll();
    }
}