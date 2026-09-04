import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Logger as PinoNestLogger, PinoLogger } from 'nestjs-pino';

import { buildCorsOptions, requestIdMiddleware } from './infrastructure';
import { CorsConfig } from './interfaces';

async function bootstrap() {
  const logger = new Logger('Main');

  // `bufferLogs`: Nest retiene lo que se loguea durante el arranque y lo suelta
  // cuando ya hay logger propio. Sin esto, todo lo anterior a `useLogger`
  // —incluidos los errores de arranque, que son los que más falta hacen— saldría
  // con el formato de consola de Nest, fuera de pino.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // A partir de aquí, TODO `new Logger(...)` de Nest escribe por pino: los
  // módulos de arranque, TypeORM, los handlers de eventos y el filtro de
  // excepciones, sin tocar ninguno de esos archivos.
  app.useLogger(app.get(PinoNestLogger));

  const configService = app.get(ConfigService);

  // CORS primero: el preflight (OPTIONS) debe resolverse antes de
  // cualquier pipe, guard o interceptor que pudiera rechazarlo.
  app.enableCors(buildCorsOptions(configService.getOrThrow<CorsConfig>('cors')));

  // Antes que pipes, guards e interceptores: así toda petición tiene un
  // identificador desde el primer instante, no solo las que fallan.
  app.use(requestIdMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  // El filtro y el interceptor son globales, pero se registran en AppModule
  // (APP_FILTER / APP_INTERCEPTOR) y no aquí: por ahí pasan por el inyector, que
  // es como el filtro recibe su logger. Montados con `useGlobalFilters` habría
  // que construirlos a mano y resolverles las dependencias uno por uno.

  // `resolve` y no `get`: PinoLogger es de scope TRANSIENT, y el inyector
  // devuelve una instancia nueva por consumidor en vez de un singleton.
  registerProcessHandlers(await app.resolve(PinoLogger));

  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);

  logger.log(`🚀 Servidor corriendo exitosamente en: ${await app.getUrl()}`)
};


/**
 * La última red: lo que revienta fuera de toda petición y de todo `catch`.
 *
 * Sin estos dos, un `await` sin protección en un handler de eventos o en una
 * tarea de arranque tumbaba el proceso con el volcado por defecto de Node —sin
 * formato, sin nivel, fuera de pino— o, peor, lo dejaba en pie con una promesa
 * rechazada que nadie miró.
 *
 * Se registra en `fatal` a propósito: es el único nivel que vacía el buffer de
 * pino de forma síncrona, y sin eso la línea se perdería al salir. Y se sale de
 * verdad, con código 1: tras un error no capturado el proceso queda en un
 * estado que nadie puede dar por bueno, así que es mejor que el orquestador lo
 * levante de cero. Registrar el listener y NO salir sería lo peligroso: apaga
 * el comportamiento por defecto de Node y deja el proceso vivo y roto.
 */
const registerProcessHandlers = (logger: PinoLogger): void => {
  logger.setContext('Process');

  process.on('uncaughtException', (error: Error) => {
    logger.fatal({ err: error }, 'Excepción no capturada: el proceso no puede continuar');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.fatal({ err: reason }, 'Promesa rechazada sin manejar: el proceso no puede continuar');
    process.exit(1);
  });
};

bootstrap();
