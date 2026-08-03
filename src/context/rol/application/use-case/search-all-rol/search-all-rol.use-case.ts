import { RolRepository } from "@/context/rol/domain/rol.repository";
import { RolResponse } from "@/context/rol/domain/types/rol-response";

export class SearchAllRolUseCase {

    constructor(
        private readonly repository: RolRepository,
    ) {}

    public async execute(): Promise<RolResponse[]> {
        return await this.repository.searchAll();
    }
}