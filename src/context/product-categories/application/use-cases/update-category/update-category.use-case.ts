import {
    CategoryName,
    ProductCategoryAlreadyExistsException,
    ProductCategoryNotFoundException,
    ProductCategoryRepository,
    TenantIdRequiredForSearchException,
    TenantNotFoundException,
    UpdateCategoryApplicationParams,
} from "../../../domain";
import { TenantChecker } from "../../ports/tenant-checker";

export class UpdateCategoryUseCase {
    constructor(
        private readonly repository: ProductCategoryRepository,
        private readonly tenantChecker: TenantChecker,
    ) { }

    public async execute(
        id: string,
        params: UpdateCategoryApplicationParams,
    ): Promise<void> {

        if (!params.tenantId) {
            throw new TenantIdRequiredForSearchException();
        }

        const tenantExists = await this.tenantChecker.exists(params.tenantId);

        if (!tenantExists) {
            throw new TenantNotFoundException(params.tenantId);
        }

        // Acotado al tenant: sin esto, cualquier tenant podría editar
        // la categoría de otro con sólo conocer su id.
        const category = await this.repository.findById(id, params.tenantId);

        if (!category) {
            throw new ProductCategoryNotFoundException(id);
        }

        const changes: {
            name?: CategoryName | undefined;
            description?: string | undefined;
        } = {};

        if (params.name !== undefined) {
            const name = CategoryName.create(params.name);

            const duplicated = await this.repository.existsByName(
                name.value,
                params.tenantId,
                id,
            );

            if (duplicated) {
                throw new ProductCategoryAlreadyExistsException(name.value);
            }

            changes.name = name;
        }

        if (params.description !== undefined) {
            changes.description = params.description;
        }

        category.update(changes);

        // El agregado es quien decide si el cambio de estado es válido:
        // activate()/deactivate() lanzan si ya se encuentra en ese estado.
        if (params.isActive !== undefined) {
            if (params.isActive) {
                category.activate();
            } else {
                category.deactivate();
            }
        }

        await this.repository.update(category);
    }
}
