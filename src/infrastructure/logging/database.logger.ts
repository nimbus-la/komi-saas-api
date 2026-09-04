import { PinoLogger } from "nestjs-pino";
import { Logger } from "typeorm";

import { QueryParameters, readableQuery } from "./query-format.util";


/**
 * El logger de la base de datos: todo lo que la capa de persistencia tenga que
 * decir sale por pino, y no por su cuenta.
 *
 * Se llama por su papel y no por la librería que hay debajo. Hoy eso significa
 * implementar la interfaz `Logger` de TypeORM —ese `implements` es el único
 * punto atado a ella—; si mañana la persistencia cambia de librería, lo que se
 * reescribe es el cuerpo de estos métodos, y ni el módulo de base de datos ni
 * el resto del proyecto tienen que enterarse.
 *
 * Sin esto las consultas salían por su cuenta —`console.log` crudo, sin
 * timestamp, sin nivel y sin `traceId`—, así que quedaban sueltas entre las
 * líneas de la petición que las había disparado y no había forma de saber cuál
 * venía de cuál.
 *
 * El `traceId` no se pasa a mano: `PinoLogger` lo saca del contexto de
 * petición (`AsyncLocalStorage`) que abre `nestjs-pino`, y la consulta ocurre
 * dentro de esa misma cadena. Una consulta lanzada fuera de una petición —al
 * arrancar, o desde un evento diferido— sale sin él, que es lo correcto: no
 * pertenece a ninguna.
 */
export class DatabaseLogger implements Logger {
    /**
     * @param logger - instancia propia: `PinoLogger` es TRANSIENT, así que
     *   fijarle el contexto no se lo cambia a nadie más.
     * @param logQueries - el `DB_LOGGING` del entorno. TypeORM llama a estos
     *   métodos SIEMPRE y deja la decisión al logger, así que si no se
     *   consultara aquí, esa variable dejaría de significar nada y las
     *   consultas aparecerían aunque estuviera en `false`.
     */
    constructor(
        private readonly logger: PinoLogger,
        private readonly logQueries: boolean
    ) {
        this.logger.setContext('TypeORM');
    };


    /**
     * Nivel `debug` a propósito: son cientos por minuto y en producción no se
     * miran. Con `LOG_LEVEL=info` desaparecen sin tocar la conexión.
     *
     * La consulta va como MENSAJE y ya con los valores puestos: los parámetros
     * en un campo aparte obligaban a contar `$1`, `$2` con el dedo para saber
     * qué se había buscado.
     */
    public logQuery(query: string, parameters?: QueryParameters): void {
        if (!this.logQueries) {
            return;
        };

        this.logger.debug(readableQuery(query, parameters));
    };


    /**
     * Se registra SIEMPRE, aunque `DB_LOGGING` esté apagado: una consulta que
     * falla no es ruido de desarrollo.
     *
     * En una petición HTTP esto se ve dos veces —aquí en el instante exacto, y
     * al final en `AllExceptionsFilter` con el volcado completo—, y las une el
     * `traceId`. La repetición vale lo que cuesta: cuando la consulta falla
     * dentro de un handler de eventos o de un `catch` que se la traga, esta es
     * la ÚNICA constancia de que ocurrió.
     */
    public logQueryError(error: string | Error, query: string, parameters?: QueryParameters): void {
        this.logger.error(
            { query: readableQuery(query, parameters) },
            error instanceof Error ? error.message : error,
        );
    };


    /**
     * Solo llega si la conexión define `maxQueryExecutionTime`; hoy no está
     * puesto, así que este método no se invoca. Queda implementado para que
     * activarlo sea añadir esa opción y nada más.
     */
    public logQuerySlow(time: number, query: string, parameters?: QueryParameters): void {
        this.logger.warn({ durationMs: time }, readableQuery(query, parameters));
    };


    public logSchemaBuild(message: string): void {
        this.logger.info(message);
    };


    public logMigration(message: string): void {
        this.logger.info(message);
    };


    /** Avisos generales de TypeORM: no distingue entre `log` e `info`. */
    public log(level: 'log' | 'info' | 'warn', message: unknown): void {
        if (level === 'warn') {
            this.logger.warn(message);
            return;
        };

        this.logger.info(message);
    };

};
