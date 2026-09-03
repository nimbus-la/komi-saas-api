import { MenuNotFoundException, MenuRepository } from "../../../domain";

/**
 * Enciende o apaga el distintivo de "nuevo" de un menú.
 *
 * Es lo único mutable del árbol: el resto se siembra por SQL. Sirve para
 * estrenar una sección con la marca puesta y quitarla cuando ya no es novedad,
 * sin tener que tocar la base a mano.
 */
export class UpdateMenuIsNewUseCase {
    constructor(
        private readonly repository: MenuRepository,
    ) { }

    public async execute(id: string, isNew: boolean): Promise<void> {
        const menu = await this.repository.findById(id);

        if (!menu) {
            throw new MenuNotFoundException(id);
        }

        menu.changeIsNew(isNew);

        await this.repository.updateIsNew(menu);
    }
}
