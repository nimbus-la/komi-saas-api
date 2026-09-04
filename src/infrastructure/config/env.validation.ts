import { plainToInstance } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min, MinLength, validateSync } from "class-validator";

import { LOG_LEVELS } from "@/interfaces";


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


    /**
     * Nivel mínimo que se escribe. Si no se define lo decide el entorno, o sea
     * `debug` al desarrollar, `info` en producción y `silent` en las pruebas.
     */
    @IsOptional()
    @IsIn([...LOG_LEVELS])
    LOG_LEVEL?: string;


    /**
     * Salida coloreada y legible en vez de JSON. Solo 'true' o 'false'
     * literales. En producción se ignora, que allí el log es JSON siempre.
     */
    @IsOptional()
    @IsIn(['true', 'false'])
    LOG_PRETTY?: string;


    /**
     * Registrar el cuerpo, la query y los parámetros de cada petición. Sirve
     * para apagarlo al desarrollar, porque en producción no se activa nunca.
     */
    @IsOptional()
    @IsIn(['true', 'false'])
    LOG_REQUEST_PAYLOAD?: string;
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