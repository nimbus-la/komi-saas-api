import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Logger as PinoNestLogger, PinoLogger } from 'nestjs-pino';

import { buildCorsOptions, registerProcessErrorHandlers } from './infrastructure';
import { CorsConfig } from './interfaces';

async function bootstrap() {
  const logger = new Logger('Main');

  // Con `bufferLogs`, Nest retiene lo que se loguea durante el arranque y lo
  // suelta cuando ya hay logger propio. Sin esto, todo lo anterior a `useLogger`
  // saldría con el formato de Nest y fuera de pino, incluidos los errores de
  // arranque, que son los que más falta hacen.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // A partir de aquí cualquier `new Logger(...)` de Nest escribe por pino, sea
  // el de los módulos de arranque, el de TypeORM o el de los eventos, sin tocar
  // ninguno de esos archivos.
  app.useLogger(app.get(PinoNestLogger));

  const configService = app.get(ConfigService);

  // CORS primero: el preflight (OPTIONS) debe resolverse antes de
  // cualquier pipe, guard o interceptor que pudiera rechazarlo.
  app.enableCors(buildCorsOptions(configService.getOrThrow<CorsConfig>('cors')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  // El filtro y el interceptor son globales pero se registran en AppModule con
  // APP_FILTER y APP_INTERCEPTOR, no aquí, porque así los construye el inyector
  // y el filtro recibe su logger. Con `useGlobalFilters` habría que armarlos a
  // mano y resolverles las dependencias una por una.

  // Cierra el último hueco, que es lo que revienta fuera de una petición y por
  // tanto nunca llega al filtro de excepciones.
  //
  // Se usa `resolve` y no `get` porque `PinoLogger` es transient y el inyector
  // devuelve una instancia nueva por consumidor en vez de un singleton.
  registerProcessErrorHandlers({
    logger: await app.resolve(PinoLogger),
    shutdown: () => app.close(),
  });

  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);

  logger.log(`🚀 Servidor corriendo exitosamente en: ${await app.getUrl()}`)
};


/**
 * El arranque puede fallar antes de que exista un logger, por ejemplo con una
 * variable de entorno inválida, la base caída o un módulo que no resuelve. Ahí
 * todavía no hay pino ni handlers de proceso, así que solo queda stderr. Lo que
 * no puede pasar es que el error se pierda y el proceso muera en silencio.
 */
bootstrap().catch((error: unknown) => {
  console.error('El arranque falló y la aplicación no llegó a levantar:', error);
  process.exit(1);
});
