# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

API multi-negocio para restaurantes (NestJS 11, TypeORM, Postgres). El `README.md` explica en qué consiste el proyecto, cómo arrancarlo, las variables de entorno y la base de datos; aquí va lo que hace falta para trabajar en el código.

Habla siempre en español con el usuario. Los comentarios del código, los mensajes de las excepciones, la documentación y los commits también van en español. Formato de commit: `Feat|Fix|Refactor|Docs (Área): Se agrega ...`.

## Comandos

```bash
docker compose up -d          # Postgres y Adminer
pnpm start:dev                # desarrollo; necesita .env (copiar .env.exam)
pnpm build
pnpm test                     # unitarias: src/**/*.spec.ts
pnpm test -- ruta/al/archivo.spec.ts      # un solo archivo
pnpm test -- -t "nombre de la prueba"     # una sola prueba
pnpm test:e2e                 # test/*.e2e-spec.ts (config en test/jest-e2e.json)
npx tsc --noEmit -p tsconfig.json         # revisar tipos
```

`pnpm lint` está roto: `eslint.config.mjs` usa la regla `prettier/prettier` y el plugin no está instalado. Además corre con `--fix`.

## Base de datos

No hay migraciones. El esquema vive en `public/db/01-init.sql`, `02-roles.sql`, etc., y Postgres solo los ejecuta cuando el volumen está vacío (`DB_SYNCHRONIZE=false`). Un cambio de esquema se escribe en esos archivos y en una base existente se aplica a mano. Las entidades se registran en cada módulo con `TypeOrmModule.forFeature` (`autoLoadEntities: true`).

## Arquitectura

La guía detallada, con ejemplos y pasos para agregar módulos, casos de uso y eventos, está en `docs/arquitectura.md`. Resumen:

DDD con arquitectura hexagonal. Un módulo por área en `src/context/*`, más `src/auth`. Todos tienen las mismas capas:

- `domain/`: agregados (heredan de `AggregateRoot` de `@/shared`), objetos de valor, repositorios como **clases abstractas**, eventos y excepciones. Sin imports de NestJS.
- `application/`: casos de uso como clases planas sin decoradores de Nest, y `ports/` como clases abstractas para todo lo que necesitan de fuera (`TenantChecker`, `InventoryItemChecker`...).
- `infrastructure/`: `http/` (controladores y DTO con class-validator) y `persistence/` (`models` de TypeORM, `mappers` entre dominio y modelo, `repositories`, y `adapters` que implementan puertos, a veces leyendo entidades de otro módulo).
- `<modulo>.module.ts`: el cableado. Las clases abstractas son los tokens de inyección (`{ provide: Puerto, useClass/useExisting: Adaptador }`) y **los casos de uso se construyen con `useFactory` + `inject`**, donde el orden de `inject` tiene que coincidir con el del constructor.
- Hay barrels `index.ts` en cada nivel. Ojo: importar el barrel de un módulo puede arrastrar controladores y con ellos `@nestjs/jwt`, que solo publica ESM y rompe ts-jest. Por eso las pruebas unitarias importan por ruta directa y las e2e hacen `jest.mock('@nestjs/jwt', ...)`.

Alias `@/*` apunta a `src/*` (en tsconfig y en las dos configs de jest). `uuid` se reemplaza en las pruebas con `test/shims/uuid.cjs`.

### Piezas transversales (`src/infrastructure`, `src/shared`)

- **Errores**: las reglas de negocio lanzan subclases de `DomainException` con un `code`. Cada código se registra en `src/shared/response-catalog.ts` con su estado HTTP y mensaje (0xxx éxito, 1xxx validación, 2xxx recurso, 9xxx sistema; cada módulo tiene su subrango, por ejemplo productos 14xx). Una excepción nueva necesita su entrada en el catálogo. `AllExceptionsFilter` es global (`APP_FILTER`) y lo que no reconoce sale como `9999`.
- **Respuestas**: `ResponseInterceptor` es global (`APP_INTERCEPTOR`) y envuelve todo en el sobre con `traceId`; los resultados vacíos salen como INFO. El mensaje de éxito se pone con `@ResponseMessage('...')`.
- **Eventos**: el agregado llama a `registerEvent(...)` y el caso de uso publica con el puerto `EventPublisher` (implementado por `EventEmitterPublisher`). Otros módulos escuchan con `@OnEvent('inventory.stock.received')`, etc. `inventory-movements` arma la bitácora solo a partir de los eventos del inventario, y los fallos del handler se registran en el log sin relanzarse.
- **Configuración**: namespaces tipados (`database`, `cors`, `jwt`, `cookie`, `logging`) en `src/infrastructure/config`, validados en `env.validation.ts`. Se leen con `configService.getOrThrow<XConfig>('nombre')`, nunca con `process.env` suelto. Las interfaces están en `src/interfaces`.
- **Logs**: nestjs-pino. El cuerpo de las peticiones se registra saneado, así que **agregar un campo sensible a un DTO obliga a sumarlo a `SENSITIVE_FIELDS` en `src/infrastructure/logging/sanitizer.util.ts`**. Detalle completo en `docs/manejo-de-errores-y-logs.md`.
- El `ValidationPipe` global usa `whitelist`, `forbidNonWhitelisted` y `transform`: el DTO tiene que declarar cada campo que acepta.

### Autenticación y negocios

- `AuthModule` registra dos guards globales, en este orden: `JwtAuthGuard` y después `TenantScopeGuard`. Toda ruta exige JWT salvo las marcadas con `@Public()`.
- El token de acceso va como Bearer; el refresh token solo viaja en la cookie httpOnly `vorea_session` (`RefreshTokenCookie`) y las sesiones se guardan en la base.
- El negocio sale del token: los controladores reciben `@CurrentUser() user: AuthenticatedUser` y pasan `user.tenantId` al caso de uso (ver `ProductController`). Los endpoints nuevos no deben aceptar `tenantId` por parámetros, query ni body. `TenantScopeGuard` es una red de seguridad que rechaza cualquier `tenantId` distinto al del token, pero no protege los endpoints que buscan un recurso solo por su id: esos tienen que filtrar por negocio en su propia consulta.

### TypeScript estricto

`tsconfig.json` activa `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` y `noUnusedLocals/Parameters`. Por eso en el código las claves opcionales se agregan de forma condicional (`...(x !== undefined ? { x } : {})`) en lugar de pasar `undefined`.
