import { PinoLogger } from "nestjs-pino";
import { Logger } from "typeorm";

import { QueryParameters, readableQuery } from "./query-format.util";


/**
 * Hace que todo lo que tenga que decir la capa de persistencia salga por pino
 * y no por su cuenta.
 *
 * Se llama por su papel y no por la librería que hay debajo. Hoy eso significa
 * implementar la interfaz `Logger` de TypeORM, y ese `implements` es lo único
 * atado a ella. Si mañana cambia la librería se reescribe el cuerpo de estos
 * métodos y nadie más se entera.
 *
 * Antes las consultas salían con `console.log`, sin hora, sin nivel y sin
 * identificador, así que quedaban sueltas entre las líneas de la petición que
 * las había disparado. El `traceId` no hay que pasarlo a mano, `PinoLogger` lo
 * saca del contexto de la petición en curso. Una consulta lanzada fuera de una
 * petición sale sin él, que es lo correcto porque no pertenece a ninguna.
 */
export class DatabaseLogger implements Logger {
    /**
     * @param logger - instancia propia, porque `PinoLogger` es transient y así
     *   fijarle el contexto no se lo cambia a nadie más.
     * @param logQueries - el `DB_LOGGING` del entorno. TypeORM llama a estos
     *   métodos siempre y deja la decisión al logger, así que sin mirarlo aquí
     *   esa variable dejaría de servir para nada.
     */
    constructor(
        private readonly logger: PinoLogger,
        private readonly logQueries: boolean
    ) {
        this.logger.setContext('TypeORM');
    };


    /**
     * Las consultas van en `debug` porque son cientos por minuto y en
     * producción no se miran. Con `LOG_LEVEL=info` dejan de salir sin tocar la
     * conexión.
     *
     * La consulta se escribe con los valores ya puestos. Con los parámetros en
     * un campo aparte había que contar `$1`, `$2` para saber qué se buscó.
     */
    public logQuery(query: string, parameters?: QueryParameters): void {
        if (!this.logQueries) {
            return;
        };

        this.logger.debug(readableQuery(query, parameters));
    };


    /**
     * Una consulta que falla se registra siempre, aunque `DB_LOGGING` esté
     * apagado, porque no es ruido de desarrollo.
     *
     * En una petición HTTP esto se ve dos veces, aquí en el momento exacto y al
     * final en el filtro con el volcado completo, y las une el `traceId`. Vale
     * la pena repetirse, porque cuando la consulta revienta dentro de un evento
     * o de un `catch` que se la traga esta es la única constancia que queda.
     */
    public logQueryError(error: string | Error, query: string, parameters?: QueryParameters): void {
        this.logger.error(
            { query: readableQuery(query, parameters) },
            error instanceof Error ? error.message : error,
        );
    };


    /**
     * Solo llega si la conexión define `maxQueryExecutionTime`, que hoy no está
     * puesto. Queda escrito para que activarlo sea añadir esa opción y nada más.
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


    /** Avisos generales de TypeORM. No distingue entre `log` e `info`. */
    public log(level: 'log' | 'info' | 'warn', message: unknown): void {
        if (level === 'warn') {
            this.logger.warn(message);
            return;
        };

        this.logger.info(message);
    };

};
