import { plainToInstance } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min, MinLength, validateSync } from "class-validator";


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
    /**
     * Obligatorio y explícito: de él dependen reglas de seguridad como
     * permitir o no localhost en CORS. Un default silencioso aquí
     * significaría fallar en ABIERTO si el servidor no lo define.
     */
    @IsEnum(Enviroment)
    NODE_ENV!: Enviroment;

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

    /**
     * Orígenes permitidos por CORS, separados por comas.
     * Obligatorio: forzarlo evita el clásico "en producción no me funciona".
     */
    @IsString()
    @MinLength(1)
    CORS_ORIGINS!: string;

    /**
     * Solo 'true' o 'false' literales. Sin esto un 'False' o un '0' pasarían
     * la validación y habría que confiar en cómo los interprete la config.
     */
    @IsOptional()
    @IsIn(['true', 'false'])
    CORS_CREDENTIALS?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    CORS_MAX_AGE?: number;


    @IsString()
    @MinLength(32)
    JWT_SECRET!: string;


    /** Vida del access token, en segundos (900 = 15 minutos). */
    @IsOptional()
    @IsInt()
    @Min(60)
    JWT_ACCESS_TTL?: number;


    /**
     * Días que vive una sesión. Es el mismo valor que
     * gobernara el refresh token, por eso conserva el nombre.
     */
    @IsOptional()
    @IsInt()
    @Min(1)
    JWT_REFRESH_TTL_DAYS?: number;
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