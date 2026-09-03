import { IsBoolean, IsUUID } from "class-validator";

export class UpdateMenuIsNewDto {
    @IsUUID()
    menuId!: string;

    /**
     * Obligatorio y explícito: quien llama dice en qué estado quiere dejar la
     * marca, no que la invierta. Así repetir la petición no la hace parpadear.
     */
    @IsBoolean()
    isNew!: boolean;
}
