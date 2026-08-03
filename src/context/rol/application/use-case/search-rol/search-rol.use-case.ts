import { RolId, RolNotFoundException } from "@/context/rol/domain";
import { RolRepository } from "@/context/rol/domain/rol.repository";
import { RolResponse } from "@/context/rol/domain/types/rol-response";

export class SearchRolUseCase {

    constructor(
        private readonly repository: RolRepository,
    ) {}

    public async execute(id: string): Promise<RolResponse> {

        const rol = await this.repository.searchById(
            RolId.create(id),
        );

        if (!rol) {
            throw new RolNotFoundException(id);
        }

        return rol;
    }
}