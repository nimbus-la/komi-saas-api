import { plainToInstance } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength, validateSync } from "class-validator";


export enum Enviroment {
    Development = 'development',
    Production = 'production',
    Test = 'test'
};


/**
 * Contrato de las variables de entorno. Si algo falta o es inválido,
 * la app NO arranca y muestra exactamente qué está mal.
 */
class EnviromentVariables {
    @IsOptional()
    @IsEnum(Enviroment)
    NODE_ENV: Enviroment = Enviroment.Development;

    @IsOptional()
    @IsInt()
    @Min(0)
    PORT: number = 3000;

    @IsString()
    @MinLength(1)
    DB_HOST!: string;

    @IsInt()
    @Min(0)
    DB_PORT!: number;

    @IsString()
    @MinLength(1)
    DB_USER!: string;

    @IsString()
    @MinLength(1)
    DB_PASSWORD!: string;

    @IsString()
    @MinLength(1)
    DB_NAME!: string;
}


export const validateEnv = (config: Record<string, unknown>): EnviromentVariables => {
    const validated = plainToInstance(EnviromentVariables, config, {
        enableImplicitConversion: true // convierte "5432" -> 5432
    });

    const errors = validateSync(validated, { skipMissingProperties: false });

    if (errors.length > 0) {
        const detailError = errors.map(
            (e) => ` - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`
        );

        throw new Error(`Ups! variables de entorno inválidas: ${detailError}`);
    };

    return validated;
};