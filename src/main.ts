import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Logger as PinoNestLogger, PinoLogger } from 'nestjs-pino';

import { buildCorsOptions, registerProcessErrorHandlers, requestIdMiddleware } from './infrastructure';
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

  // Cierra el último hueco: lo que revienta FUERA de una petición y, por tanto,
  // nunca llega al filtro de excepciones.
  //
  // `resolve` y no `get`: PinoLogger es de scope TRANSIENT, y el inyector
  // devuelve una instancia nueva por consumidor en vez de un singleton.
  registerProcessErrorHandlers({
    logger: await app.resolve(PinoLogger),
    shutdown: () => app.close(),
  });

  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);

  logger.log(`🚀 Servidor corriendo exitosamente en: ${await app.getUrl()}`)
};


bootstrap();
